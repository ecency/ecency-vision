import { relayInit, SubscriptionOptions } from "./relay";
import { Filter } from "./filter";
import { Event } from "./event";

export interface SimplePoolOptions {
  eoseSubTimeout?: number;
  getTimeout?: number;
  listTimeout?: number;
}

function normalizeURL(url: string) {
  let p = new URL(url);
  p.pathname = p.pathname.replace(/\/+/g, "/");
  if (p.pathname.endsWith("/")) p.pathname = p.pathname.slice(0, -1);
  if ((p.port === "80" && p.protocol === "ws:") || (p.port === "443" && p.protocol === "wss:"))
    p.port = "";
  p.searchParams.sort();
  p.hash = "";
  return p.toString();
}

export default class SimplePool {
  _conn: any;
  _seenOn = {};
  eoseSubTimeout: number;
  getTimeout: number;
  constructor(options: SimplePoolOptions = {}) {
    this._conn = {};
    this.eoseSubTimeout = options.eoseSubTimeout || 3400;
    this.getTimeout = options.getTimeout || 3400;
  }

  close(relays: string[]) {
    relays.forEach((url: string) => {
      let relay = this._conn[normalizeURL(url)];
      if (relay) relay.close();
    });
  }
  async ensureRelay(url: string) {
    const nm = normalizeURL(url);
    if (!this._conn[nm]) {
      this._conn[nm] = relayInit(nm, {
        getTimeout: this.getTimeout * 0.9,
        listTimeout: this.getTimeout * 0.9
      });
    }
    const relay = this._conn[nm];
    await relay.connect();
    return relay;
  }
  sub(relays: string[], filters: Filter[], opts?: SubscriptionOptions) {
    let _knownIds = /* @__PURE__ */ new Set();
    let modifiedOpts = { ...(opts || {}) };
    modifiedOpts.alreadyHaveEvent = (id: number, url: string) => {
      if (opts?.alreadyHaveEvent?.(id, url)) {
        return true;
      }
      let set = this._seenOn[id] || /* @__PURE__ */ new Set();
      set.add(url);
      this._seenOn[id] = set;
      return _knownIds.has(id);
    };
    let subs: any = [];
    let eventListeners = /* @__PURE__ */ new Set();
    let eoseListeners = /* @__PURE__ */ new Set();
    let eosesMissing = relays.length;
    let eoseSent = false;
    let eoseTimeout = setTimeout(() => {
      eoseSent = true;
      for (let cb of eoseListeners.values()) (cb as any)();
    }, this.eoseSubTimeout);
    relays.forEach(async (relay: any) => {
      let r;
      try {
        r = await this.ensureRelay(relay);
      } catch (err) {
        handleEose();
        return;
      }
      if (!r) return;
      let s = r.sub(filters, modifiedOpts);
      s.on("event", (event: Event) => {
        _knownIds.add(event.id);
        for (let cb of eventListeners.values()) (cb as any)(event);
      });
      s.on("eose", () => {
        if (eoseSent) return;
        handleEose();
      });
      subs.push(s);
      function handleEose() {
        eosesMissing--;
        if (eosesMissing === 0) {
          clearTimeout(eoseTimeout);
          for (let cb of eoseListeners.values()) (cb as any)();
        }
      }
    });
    let greaterSub = {
      sub(filters2: any, opts2: any) {
        subs.forEach((sub: any) => sub.sub(filters2, opts2));
        return greaterSub;
      },
      unsub() {
        subs.forEach((sub: any) => sub.unsub());
      },
      on(type: any, cb: any) {
        if (type === "event") {
          eventListeners.add(cb);
        } else if (type === "eose") {
          eoseListeners.add(cb);
        }
      },
      off(type: any, cb: any) {
        if (type === "event") {
          eventListeners.delete(cb);
        } else if (type === "eose") eoseListeners.delete(cb);
      }
    };
    return greaterSub;
  }
  get(relays: string[], filter: Filter, opts: SubscriptionOptions) {
    return new Promise((resolve) => {
      let sub = this.sub(relays, [filter], opts);
      let timeout = setTimeout(() => {
        sub.unsub();
        resolve(null);
      }, this.getTimeout);
      sub.on("event", (event: Event) => {
        resolve(event);
        clearTimeout(timeout);
        sub.unsub();
      });
    });
  }
  list(relays: string[], filters: Filter[], opts: SubscriptionOptions) {
    return new Promise((resolve) => {
      let events: Event[] = [];
      let sub = this.sub(relays, filters, opts);
      sub.on("event", (event: Event) => {
        events.push(event);
      });
      sub.on("eose", () => {
        sub.unsub();
        resolve(events);
      });
    });
  }
  publish(relays: string[], event: Event) {
    const pubPromises = relays.map(async (relay: string) => {
      let r;
      try {
        r = await this.ensureRelay(relay);
        return r.publish(event);
      } catch (_) {
        return { on() {}, off() {} };
      }
    });
    const callbackMap = /* @__PURE__ */ new Map();
    return {
      on(type: string, cb: { (): void; (): void; (arg0: any): any }) {
        relays.forEach(async (relay: any, i: string | number) => {
          let pub = await pubPromises[i];
          let callback = () => cb(relay);
          callbackMap.set(cb, callback);
          pub.on(type, callback);
        });
      },
      off(type: any, cb: any) {
        relays.forEach(async (_: any, i: string | number) => {
          let callback = callbackMap.get(cb);
          if (callback) {
            let pub = await pubPromises[i];
            pub.off(type, callback);
          }
        });
      }
    };
  }
  seenOn(id: string) {
    return Array.from(this._seenOn[id]?.values?.() || []);
  }
}

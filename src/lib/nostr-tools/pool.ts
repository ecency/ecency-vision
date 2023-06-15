import { Relay, relayInit } from "./relay";
import { Filter } from "./filter";
import { Event } from "./event";

// interface SimplePoolTypes {
//   private _conn
//   private _seenOn
//   private eoseSubTimeout
//   private getTimeout
//   constructor(options?: {eoseSubTimeout?: number; getTimeout?: number})
//   close(relays: string[]): void
//   ensureRelay(url: string): Promise<Relay>
//   sub(relays: string[], filters: Filter[], opts?: SubscriptionOptions): Sub
//   get(
//     relays: string[],
//     filter: Filter,
//     opts?: SubscriptionOptions
//   ): Promise<Event | null>
//   list(
//     relays: string[],
//     filters: Filter[],
//     opts?: SubscriptionOptions
//   ): Promise<Event[]>
//   publish(relays: string[], event: Event): Pub
//   seenOn(id: string): string[]
// }

export interface SimplePoolOptions {
  eoseSubTimeout?: number;
  getTimeout?: number;
  listTimeout?: number;
}

function normalizeURL(url) {
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
  _conn;
  _seenOn = {};
  eoseSubTimeout;
  getTimeout;
  constructor(options = {}) {
    this._conn = {};
    this.eoseSubTimeout = options.eoseSubTimeout || 3400;
    this.getTimeout = options.getTimeout || 3400;
  }

  close(relays) {
    relays.forEach((url) => {
      let relay = this._conn[normalizeURL(url)];
      if (relay) relay.close();
    });
  }
  async ensureRelay(url) {
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
  sub(relays, filters, opts?) {
    let _knownIds = /* @__PURE__ */ new Set();
    let modifiedOpts = { ...(opts || {}) };
    modifiedOpts.alreadyHaveEvent = (id, url) => {
      if (opts?.alreadyHaveEvent?.(id, url)) {
        return true;
      }
      let set = this._seenOn[id] || /* @__PURE__ */ new Set();
      set.add(url);
      this._seenOn[id] = set;
      return _knownIds.has(id);
    };
    let subs = [];
    let eventListeners = /* @__PURE__ */ new Set();
    let eoseListeners = /* @__PURE__ */ new Set();
    let eosesMissing = relays.length;
    let eoseSent = false;
    let eoseTimeout = setTimeout(() => {
      eoseSent = true;
      for (let cb of eoseListeners.values()) cb();
    }, this.eoseSubTimeout);
    relays.forEach(async (relay) => {
      let r;
      try {
        r = await this.ensureRelay(relay);
      } catch (err) {
        handleEose();
        return;
      }
      if (!r) return;
      let s = r.sub(filters, modifiedOpts);
      s.on("event", (event) => {
        _knownIds.add(event.id);
        for (let cb of eventListeners.values()) cb(event);
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
          for (let cb of eoseListeners.values()) cb();
        }
      }
    });
    let greaterSub = {
      sub(filters2, opts2) {
        subs.forEach((sub) => sub.sub(filters2, opts2));
        return greaterSub;
      },
      unsub() {
        subs.forEach((sub) => sub.unsub());
      },
      on(type, cb) {
        if (type === "event") {
          eventListeners.add(cb);
        } else if (type === "eose") {
          eoseListeners.add(cb);
        }
      },
      off(type, cb) {
        if (type === "event") {
          eventListeners.delete(cb);
        } else if (type === "eose") eoseListeners.delete(cb);
      }
    };
    return greaterSub;
  }
  get(relays, filter, opts) {
    return new Promise((resolve) => {
      let sub = this.sub(relays, [filter], opts);
      let timeout = setTimeout(() => {
        sub.unsub();
        resolve(null);
      }, this.getTimeout);
      sub.on("event", (event) => {
        resolve(event);
        clearTimeout(timeout);
        sub.unsub();
      });
    });
  }
  list(relays, filters, opts) {
    return new Promise((resolve) => {
      let events = [];
      let sub = this.sub(relays, filters, opts);
      sub.on("event", (event) => {
        events.push(event);
      });
      sub.on("eose", () => {
        sub.unsub();
        resolve(events);
      });
    });
  }
  publish(relays, event) {
    const pubPromises = relays.map(async (relay) => {
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
      on(type, cb) {
        relays.forEach(async (relay, i) => {
          let pub = await pubPromises[i];
          let callback = () => cb(relay);
          callbackMap.set(cb, callback);
          pub.on(type, callback);
        });
      },
      off(type, cb) {
        relays.forEach(async (_, i) => {
          let callback = callbackMap.get(cb);
          if (callback) {
            let pub = await pubPromises[i];
            pub.off(type, callback);
          }
        });
      }
    };
  }
  seenOn(id) {
    return Array.from(this._seenOn[id]?.values?.() || []);
  }
}

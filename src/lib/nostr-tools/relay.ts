/* global WebSocket */

import { Event, verifySignature, validateEvent } from "./event";
import { Filter } from "./filter";
import { SimplePoolOptions } from "./pool";

type RelayEvent = "connect" | "disconnect" | "error" | "notice" | "auth";

export type Relay = {
  enabled?: any;
  url: string;
  status: number;
  connect: () => Promise<void>;
  close: () => Promise<void>;
  sub: (filters: Filter[], opts?: SubscriptionOptions) => Sub;
  publish: (event: Event) => Pub;
  auth: (event: Event) => Pub;
  on: (type: RelayEvent, cb: any) => void;
  off: (type: RelayEvent, cb: any) => void;
};
export type Pub = {
  on: (type: "ok" | "seen" | "failed", cb: any) => void;
  off: (type: "ok" | "seen" | "failed", cb: any) => void;
};
export type Sub = {
  sub: (filters: Filter[], opts: SubscriptionOptions) => Sub;
  unsub: () => void;
  on: (type: "event" | "eose", cb: any) => void;
  off: (type: "event" | "eose", cb: any) => void;
};

export type SubscriptionOptions = {
  skipVerification?: boolean;
  id?: string;
  alreadyHaveEvent?: any;
};

function getSubscriptionId(json: string | any[]) {
  let idx = json.slice(0, 22).indexOf(`"EVENT"`);
  if (idx === -1) return null;
  let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
  if (pstart === -1) return null;
  let start = idx + 7 + 1 + pstart;
  let pend = json.slice(start + 1, 80).indexOf(`"`);
  if (pend === -1) return null;
  let end = start + 1 + pend;
  return json.slice(start + 1, end);
}

function getHex64(json: string | string[], field: string | any[]) {
  let len = field.length + 3;
  let idx = json.indexOf(`"${field}":`) + len;
  let s = json.slice(idx).indexOf(`"`) + idx + 1;
  return json.slice(s, s + 64);
}

export function relayInit(url: string, options: SimplePoolOptions = {}) {
  let { listTimeout = 3e3, getTimeout = 3e3 } = options;
  var ws: WebSocket;
  var openSubs = {};
  var listeners = {
    connect: [],
    disconnect: [],
    error: [],
    notice: []
  };
  var subListeners = {};
  var pubListeners = {};
  var connectionPromise: Promise<void> | undefined;
  async function connectRelay() {
    if (connectionPromise) return connectionPromise;
    connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        ws = new WebSocket(url);
      } catch (err) {
        reject(err);
      }
      ws.onopen = () => {
        listeners.connect.forEach((cb: any) => cb());
        resolve();
      };
      ws.onerror = () => {
        connectionPromise = void 0;
        listeners.error.forEach((cb: any) => cb());
        reject();
      };
      ws.onclose = async () => {
        connectionPromise = void 0;
        listeners.disconnect.forEach((cb: any) => cb());
      };
      let incomingMessageQueue: any[] = [];
      let handleNextInterval: any;
      ws.onmessage = (e) => {
        incomingMessageQueue.push(e.data);
        if (!handleNextInterval) {
          handleNextInterval = setInterval(handleNext, 0);
        }
      };
      async function handleNext() {
        if (incomingMessageQueue.length === 0) {
          clearInterval(handleNextInterval);
          handleNextInterval = null;
          return;
        }
        var json = incomingMessageQueue.shift();
        if (!json) return;
        let subid: any = getSubscriptionId(json);
        if (subid) {
          let so = openSubs[subid];
          if (so && so.alreadyHaveEvent && so.alreadyHaveEvent(getHex64(json, "id"), url)) {
            return;
          }
        }
        try {
          let data = JSON.parse(json);
          switch (data[0]) {
            case "EVENT":
              let id = data[1];
              let event = data[2];
              if (
                validateEvent(event) &&
                openSubs[id] &&
                (openSubs[id].skipVerification || (await verifySignature(event)))
              ) {
                openSubs[id];
                (subListeners[id]?.event || []).forEach((cb: any) => cb(event));
              }
              return;
            case "EOSE": {
              let id2 = data[1];
              if (id2 in subListeners) {
                subListeners[id2].eose.forEach((cb: any) => cb());
                subListeners[id2].eose = [];
              }
              return;
            }
            case "OK": {
              let id2 = data[1];
              let ok = data[2];
              let reason = data[3] || "";
              if (id2 in pubListeners) {
                if (ok) pubListeners[id2].ok.forEach((cb: any) => cb());
                else pubListeners[id2].failed.forEach((cb: any) => cb(reason));
                pubListeners[id2].ok = [];
                pubListeners[id2].failed = [];
              }
              return;
            }
            case "NOTICE":
              let notice = data[1];
              listeners.notice.forEach((cb: any) => cb(notice));
              return;
          }
        } catch (err) {
          return;
        }
      }
    });
    return connectionPromise;
  }
  function connected() {
    return ws?.readyState === 1;
  }
  async function connect() {
    if (connected()) return;
    await connectRelay();
  }
  async function trySend(params: any) {
    let msg = JSON.stringify(params);
    if (!connected()) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!connected()) {
        return;
      }
    }
    try {
      ws.send(msg);
    } catch (err) {
      console.log(err);
    }
  }
  const sub = (
    filters: any[],
    {
      skipVerification = false,
      alreadyHaveEvent = null,
      id = Math.random().toString().slice(2)
    } = {}
  ) => {
    let subid = id;
    openSubs[subid] = {
      id: subid,
      filters,
      skipVerification,
      alreadyHaveEvent
    };
    trySend(["REQ", subid, ...filters]);
    return {
      sub: (newFilters: any, newOpts: SubscriptionOptions = {}) =>
        sub(newFilters || filters, {
          skipVerification: newOpts.skipVerification || skipVerification,
          alreadyHaveEvent: newOpts.alreadyHaveEvent || alreadyHaveEvent,
          id: subid
        }),
      unsub: () => {
        delete openSubs[subid];
        delete subListeners[subid];
        trySend(["CLOSE", subid]);
      },
      on: (type: string | number, cb: any) => {
        subListeners[subid] = subListeners[subid] || {
          event: [],
          eose: []
        };
        subListeners[subid][type].push(cb);
      },
      off: (type: string | number, cb: any) => {
        let listeners2 = subListeners[subid];
        let idx = listeners2[type].indexOf(cb);
        if (idx >= 0) listeners2[type].splice(idx, 1);
      }
    };
  };
  return {
    url,
    sub,
    on: (type: string, cb: () => void) => {
      listeners[type].push(cb);
      if (type === "connect" && ws?.readyState === 1) {
        cb();
      }
    },
    off: (type: string | number, cb: any) => {
      let index = listeners[type].indexOf(cb);
      if (index !== -1) listeners[type].splice(index, 1);
    },
    list: (
      filters: any[],
      opts:
        | {
            skipVerification?: boolean | undefined;
            alreadyHaveEvent?: null | undefined;
            id?: string | undefined;
          }
        | undefined
    ) =>
      new Promise((resolve) => {
        let s = sub(filters, opts);
        let events: any = [];
        let timeout = setTimeout(() => {
          s.unsub();
          resolve(events);
        }, listTimeout);
        s.on("eose", () => {
          s.unsub();
          clearTimeout(timeout);
          resolve(events);
        });
        s.on("event", (event: any) => {
          events.push(event);
        });
      }),
    get: (
      filter: any,
      opts:
        | {
            skipVerification?: boolean | undefined;
            alreadyHaveEvent?: null | undefined;
            id?: string | undefined;
          }
        | undefined
    ) =>
      new Promise((resolve) => {
        let s = sub([filter], opts);
        let timeout = setTimeout(() => {
          s.unsub();
          resolve(null);
        }, getTimeout);
        s.on("event", (event: any) => {
          s.unsub();
          clearTimeout(timeout);
          resolve(event);
        });
      }),
    publish(event: any) {
      if (!event.id) throw new Error(`event ${event} has no id`);
      let id = event.id;
      trySend(["EVENT", event]);
      return {
        on: (type: string | number, cb: any) => {
          pubListeners[id] = pubListeners[id] || {
            ok: [],
            failed: []
          };
          pubListeners[id][type].push(cb);
        },
        off: (type: string | number, cb: any) => {
          let listeners2 = pubListeners[id];
          if (!listeners2) return;
          let idx = listeners2[type].indexOf(cb);
          if (idx >= 0) listeners2[type].splice(idx, 1);
        }
      };
    },
    connect,
    close() {
      listeners = { connect: [], disconnect: [], error: [], notice: [] };
      subListeners = {};
      pubListeners = {};
      if (ws.readyState === WebSocket.OPEN) {
        ws?.close();
      }
    },
    status() {
      return ws?.readyState ?? 3;
    }
  };
}

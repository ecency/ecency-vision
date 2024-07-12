import { Context, createContext, PropsWithChildren, Provider, useContext } from "react";
import { isServer } from "@tanstack/react-query";

export namespace EcencyClientServerBridge {
  interface SafeContext<T> {
    serverStub?: T;
    ClientContext?: Context<T>;
    ClientContextProvider: Provider<T>;
  }

  export function useSafeContext<T>(ctx: SafeContext<T>) {
    if (isServer && ctx.serverStub) {
      return ctx.serverStub;
    }

    if (ctx.ClientContext) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useContext(ctx.ClientContext);
    }

    throw new Error("Invalid safe context initialization");
  }

  export function createSafeContext<S>(ctxState: S): SafeContext<S> {
    if (isServer) {
      return {
        serverStub: ctxState,
        ClientContextProvider: ((props: PropsWithChildren) => (
          <>{props.children}</>
        )) as unknown as Provider<S>
      };
    }
    const clientContext = createContext(ctxState);

    return {
      ClientContext: clientContext,
      ClientContextProvider: clientContext.Provider
    };
  }
}

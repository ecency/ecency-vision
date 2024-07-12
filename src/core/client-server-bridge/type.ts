import { Context, Provider } from "react";

export interface SafeContext<T> {
  serverStub?: T;
  ClientContext?: Context<T>;
  ClientContextProvider: Provider<T>;
}

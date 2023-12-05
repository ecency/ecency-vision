import { create } from "zustand";
import { createGlobalModule } from "./global-module";
import { GlobalStore } from "./typings";

export const useGlobalStore = create<GlobalStore>((set, getState, store) => ({
  global: createGlobalModule(set)
}));

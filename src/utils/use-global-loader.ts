export function useGlobalLoader() {
  return {
    show: () =>
      document
        .querySelector(".ecency-global-loader")
        ?.classList.remove("ecency-global-loader-hidden"),
    hide: () =>
      document.querySelector(".ecency-global-loader")?.classList.add("ecency-global-loader-hidden")
  };
}

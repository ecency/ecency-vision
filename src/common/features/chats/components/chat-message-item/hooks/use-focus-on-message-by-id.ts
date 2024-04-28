import { useCallback } from "react";
import { useTimeoutFn } from "react-use";

export function useFocusOnMessageById(id?: string) {
  const getElementById = useCallback(() => {
    try {
      return document.querySelector(`[data-message-id="${id}"]`);
    } catch (e) {
      return null;
    }
  }, [id]);

  const [isReady, cancel, reset] = useTimeoutFn(() => {
    const element = getElementById();

    element?.classList.remove("bg-blue-dark-sky");
    element?.classList.remove("bg-opacity-20");
  }, 1000);

  const focus = useCallback(() => {
    const element = getElementById();

    element?.scrollIntoView({ behavior: "smooth" });
    element?.classList.add("bg-blue-dark-sky");
    element?.classList.add("bg-opacity-20");

    reset();
  }, [id, getElementById]);

  return {
    focus
  };
}

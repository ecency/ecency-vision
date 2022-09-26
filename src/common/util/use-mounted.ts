import { useRef, useEffect } from "react";

export function useMounted(): boolean {
  const ref = useRef<boolean>(false);
  useEffect(() => {
    ref.current = true;
  }, []);
  return ref.current;
}

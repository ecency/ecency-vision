import useLocalStorage from "react-use/lib/useLocalStorage";
import useMount from "react-use/lib/useMount";

type useLocalStorageType = typeof useLocalStorage;

interface SynchronizedLocalStorageEvent<T> {
  value?: T;
  key: string;
}

const SYNCHRONIZED_LOCAL_STORAGE_EVENT = "useSynchronizedLocalStorageUpdate";

/**
 * Allow to one local storage record and keep live-time update wherever this hook will be called in app
 *
 * It uses window event bus for sharing updates between instances
 *
 * Keep in mind that this live-time update is synchronous process
 *
 * @param key Local storage record key
 * @param initialValue Initial value
 * @param options Options of serialization and deserialization
 */
export function useSynchronizedLocalStorage<T>(
  key: string,
  initialValue?: T,
  options?: Parameters<useLocalStorageType>[2]
) {
  // As TS 4.8+ only supports passing generic to function type
  // Replace it with: type useLocalStorageType<T> = typeof useLocalStorage<T>;

  const [value, setValue, clearValue] = useLocalStorage<T>(key, initialValue, options as any);

  useMount(() => {
    window.addEventListener(SYNCHRONIZED_LOCAL_STORAGE_EVENT, (e) => {
      const typedEvent = e as unknown as CustomEvent<SynchronizedLocalStorageEvent<T>>;
      if (typedEvent.detail.key === key) {
        if (typeof typedEvent.detail.value !== "undefined") {
          setValue(typedEvent.detail.value);
        } else {
          clearValue();
        }
      }
    });
  });

  return [
    value,
    (v?: T) => {
      setValue(v);

      const event = new CustomEvent<SynchronizedLocalStorageEvent<T>>(
        SYNCHRONIZED_LOCAL_STORAGE_EVENT,
        { detail: { key, value: v } }
      );
      window.dispatchEvent(event);
    },
    () => {
      const event = new CustomEvent<SynchronizedLocalStorageEvent<T>>(
        SYNCHRONIZED_LOCAL_STORAGE_EVENT,
        { detail: { key } }
      );
      window.dispatchEvent(event);

      clearValue();
    }
  ] as const;
}

import React, { ComponentType, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppState, history } from "../../store";
import { savePageScroll } from "../../store/persistent-page-scroll";

/**
 * Make scroll position on page persistent between navigations
 * @HOC
 * @param Component Any component where need to persist scroll
 */
export function withPersistentScroll<P>(Component: ComponentType<P>) {
  return (props: P) => {
    const dispatch = useDispatch();
    const location = useLocation();

    const [isPageScrolledToPersistent, setPageScrolledToPersistent] = useState(false);

    const pageScrollState = useSelector(
      (state: AppState) => state.persistentPageScroll[location.pathname] || {}
    );

    // Do scroll to the given position with retries while it won't be achieved or retries won't be 5
    const scrollWithDebounce = async (
      scrollValue: number,
      debounceTime = 100,
      retries = 1
    ): Promise<any> => {
      if (retries === 5) {
        setPageScrolledToPersistent(true);
        return;
      }

      window.scroll(0, scrollValue);
      await new Promise((resolve) => setTimeout(resolve, debounceTime));

      if (window.scrollY <= scrollValue) {
        return scrollWithDebounce(scrollValue, debounceTime, retries + 1);
      } else {
        setPageScrolledToPersistent(true);
      }
    };

    useEffect(() => {
      if (history!!.action === "POP" && !isPageScrolledToPersistent) {
        scrollWithDebounce(pageScrollState.scroll);
      }

      return () => {
        dispatch(savePageScroll({ pageName: location.pathname, scrollValue: window.scrollY }));
      };
    }, [props]);

    return <Component {...props} />;
  };
}

import React, {
  useState,
  useRef,
  useEffect,
  ReactElement,
  MouseEventHandler,
  TouchEventHandler
} from "react";

interface Props {
  value: number;
  mode: string;
  setVoteValue: (value: number) => void;
}

const VotingSlider = (props: Props) => {
  const sliderRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [moving, setMoving] = useState(false);
  const [mouseX, setmouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [sliderVal, setSliderVal] = useState(Math.abs(props.value));
  const tenOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const fiveOptions = [25, 50, 75];

  const [sliderOptions, setSliderOptions] = useState(
    window.innerWidth > 1600 ? tenOptions : fiveOptions
  );

  useEffect(() => {
    const addResizeEventListner = (): void =>
      window.addEventListener("resize", _wondowResizeHandler, true);

    addResizeEventListner();

    return () => {
      window.removeEventListener("mouseup", _windowMouseUP, true);
      window.removeEventListener("resize", _wondowResizeHandler, true);
    };
  }, []);

  useEffect(() => {
    const setValueEffect = (): void => {
      setSliderVal(Math.abs(props.value));
    };
    setValueEffect();
  }, [props.value]);

  useEffect(() => {
    const moveUseEffect = (): void => {
      if (moving) {
        window.addEventListener("mousemove", _mousemoveEventHandler, true);
        window.addEventListener("mouseup", _windowMouseUP, true);

        document.body.classList.add("no-select");
      } else {
        document.body.classList.remove("no-select");
      }
    };
    moveUseEffect();
    return () => {
      window.removeEventListener("mouseup", _windowMouseUP, true);
    };
  }, [moving]);

  useEffect(() => {
    const el: HTMLDivElement | null = sliderRef.current;
    const rect: DOMRect | undefined = el?.getBoundingClientRect();

    if (rect && el) {
      const x = mouseX - rect?.left;
      const sliderValueFixed: number = parseFloat(((x / el?.offsetWidth) * 100).toFixed(1));
      setSliderValue(sliderValueFixed);
    }
  }, [mouseX]);

  const setSliderValue = (value: number): void => {
    if (value > 100) value = 100;
    if (value < 0) value = 0;

    setSliderVal(Math.abs(value));
    props.setVoteValue(props.mode == "up" ? value : -value);
  };
  const _wondowResizeHandler = () => {
    setSliderOptions(window.innerWidth > 1600 ? tenOptions : fiveOptions);
  };

  const _windowMouseUP = () => {
    window.removeEventListener("mousemove", _mousemoveEventHandler, true);
  };

  const _mousemoveEventHandler: any = (event: MouseEvent): void => {
    setmouseX(event.clientX);
    setMouseY(event.clientY);
  };

  const handleMouseDown = (event: any) => {
    setMoving(true);
    _mousemoveEventHandler(event);
  };

  const handleMouseUp = (event: any): void => {
    setMoving(false);
  };

  const _handleTouchMovement = (touch: Touch) => {
    const el: HTMLDivElement | null = sliderRef.current;
    const rect: DOMRect | undefined = el?.getBoundingClientRect();
    if (rect && el) {
      const x = touch.clientX - rect?.left;
      const sliderValueFixed: number = parseFloat(((x / el?.offsetWidth) * 100).toFixed(1));
      setSliderValue(sliderValueFixed);
    }
  };

  const handleTouchMovement = (event: any) => {
    _handleTouchMovement(event.touches[0]);
  };

  const handleTouchStart = (event: any) => {
    _handleTouchMovement(event.touches[0]);
  };

  const displayDots = (): ReactElement => {
    const width: string = sliderOptions[0].toString() + "%";

    return (
      <>
        <div className="dots-container">
          <div style={{ width }} />

          {sliderOptions.map((option: number) => {
            var backgroundClr: string;
            if (sliderVal >= option - 2) {
              backgroundClr = props.mode == "up" ? "#357ce6" : "rgba(191, 48, 48, 0.8)";
            } else {
              backgroundClr = "#d4cfcf";
            }
            return (
              <div style={{ width }} key={option}>
                <span className="slider-dot" style={{ background: backgroundClr }} />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const displayOptions = (): ReactElement => {
    const width: string = sliderOptions[0].toString() + "%";

    return (
      <>
        <div className="label-container" style={{ pointerEvents: moving ? "none" : "all" }}>
          <div style={{ width }} />
          {sliderOptions.map((option: number) => {
            return (
              <div style={{ width }} key={option}>
                <p
                  style={{ marginLeft: "-4px", pointerEvents: moving ? "none" : "all" }}
                  onClick={() => setSliderValue(option)}
                >
                  {props.mode == "up" ? option : -option}
                </p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div style={{ height: "40px", paddingRight: "13px" }}>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchMove={handleTouchMovement}
        onTouchStart={handleTouchStart}
        ref={sliderRef}
        className="slide"
      >
        <div className="slide-background-line">
          <div
            className="slider-line"
            style={{
              width: sliderVal.toString() + "%",
              background: props.mode == "up" ? "#357ce6" : "rgba(191, 48, 48)",
              zIndex: 100
            }}
          />
          <span
            className="slider-dot pointer-dot"
            style={{
              left: sliderVal.toString() + "%",
              background: props.mode == "up" ? "#357ce6" : "rgba(191, 48, 48)"
            }}
          />
          {displayDots()}
        </div>
      </div>
      {displayOptions()}
    </div>
  );
};

export default VotingSlider;

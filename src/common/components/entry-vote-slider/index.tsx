import React, { useState, useRef, useEffect, ReactElement } from "react";

interface Props {
  value: number;
  mode: string;
  setVoteValue: (value: number) => void;
}

const VotingSlider = (props: Props) => {
  const sliderRef: React.RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [moving, setMoving] = useState(false);
  const [sliderVal, setSliderVal] = useState(Math.abs(props.value));
  const tenOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90];
  const fiveOptions = [25, 50, 75];

  const [sliderOptions, setSliderOptions] = useState(
    window.innerWidth > 1600 ? tenOptions : fiveOptions
  );

  useEffect(() => {
    const addResizeEventListner = (): void =>
      window.addEventListener("resize", () => {
        setSliderOptions(window.innerWidth > 1600 ? tenOptions : fiveOptions);
      });

    addResizeEventListner();

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  useEffect(() => {
    setSliderVal(Math.abs(props.value));
  }, [props.value]);

  const setSliderValue = (value: number): void => {
    if (value < 0 || value > 100) return;
    setSliderVal(Math.abs(value));
    props.setVoteValue(props.mode == "up" ? value : -value);
  };

  const _handleMouseMovement = (event: any) => {
    const el: HTMLDivElement | null = sliderRef.current;
    const rect: DOMRect | undefined = el?.getBoundingClientRect();
    if (event && rect && el) {
      const x = event?.clientX - rect?.left;
      const sliderValueFixed: number = parseFloat(((x / el?.offsetWidth) * 100).toFixed(1));
      setSliderValue(sliderValueFixed);
    }
  };

  const handleMouseMovement = (event: any) => {
    if (moving == true) {
      if (event.type == "touchmove") {
        event = event.touches[0];
      }
      _handleMouseMovement(event);
    }
  };

  const handleMouseDown = (event: any) => {
    setMoving(true);
    if (event.type == "touchstart" || event.type == "touchend") {
      event = event.touches[0];
    }
    _handleMouseMovement(event);
  };

  const handleMouseUp = (event: any): void => {
    if (event.type == "touchstart" || event.type == "touchend") {
      event = event.touches[0];
    }
    setMoving(false);
  };

  const handleMouseLeave = (): void => {
    setMoving(false);
  };

  const displayDots = (): ReactElement => {
    const width: string = sliderOptions[0].toString() + "%";

    return (
      <>
        <div className="dots-container">
          <div style={{ width }} />

          {sliderOptions.map((option: number) => {
            var backgroundClr: string;
            if (sliderVal >= option) {
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
        <div className="label-container">
          <div style={{ width }} />
          {sliderOptions.map((option: number) => {
            return (
              <div style={{ width }} key={option}>
                <p style={{ marginLeft: "-4px" }} onClick={() => setSliderValue(option)}>
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
    <div style={{ height: "24px", paddingRight: "13px" }}>
      <div
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMovement}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleMouseMovement}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseDown}
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

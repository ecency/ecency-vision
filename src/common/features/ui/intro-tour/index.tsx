import React, { useEffect, useMemo, useState } from "react";
import { IntroStep } from "@ui/core";
import { useMountedState } from "react-use";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { classNameObject } from "../../../helper/class-name-object";
import { Button } from "@ui/button";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";

interface Props {
  steps: IntroStep[];
  id: string;
  enabled: boolean;
}

export function IntroTour({ steps, id, enabled }: Props) {
  const [currentStep, setCurrentStep, clearCurrentStep] = useLocalStorage<number | undefined>(
    PREFIX + `_it_${id}`,
    undefined
  );
  const [isFinished, setIsFinished] = useLocalStorage(PREFIX + `_itf_${id}`, false);

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();

  const isMounted = useMountedState();
  const popper = usePopper(host, popperElement, {
    placement: "top"
  });

  const step = useMemo(
    () => (typeof currentStep === "number" ? steps[currentStep] : undefined),
    [currentStep, steps]
  );
  const totalSteps = useMemo(() => steps.length, [steps]);
  const isFirstStep = useMemo(
    () => typeof currentStep === "number" && currentStep > 0,
    [currentStep]
  );
  const isLastStep = useMemo(() => steps.length - 1 === currentStep, [steps, currentStep]);

  // Detect enablement and set default step if there aren't any persistent step
  useEffect(() => {
    if (typeof currentStep === "undefined" && !isFinished && enabled) {
      setCurrentStep(0);
    }
  }, [currentStep, enabled, isFinished]);

  // Re-attach host element based on host element
  useEffect(() => {
    if (step) {
      const nextHost = document.querySelector(step.targetSelector);
      setHost(nextHost);

      if (nextHost) {
        nextHost.classList.add("z-[1041]");
        nextHost.classList.add("relative");
        (nextHost as HTMLElement).focus();
      }
    } else {
      host?.classList.remove("z-[1041]");
      host?.classList.remove("relative");
      setHost(null);
    }
  }, [step]);

  const nextStep = () => {
    if (typeof currentStep === "number" && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (typeof currentStep === "number" && currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finish = () => {
    clearCurrentStep();
    setIsFinished(true);
  };

  return isMounted() && !isFinished ? (
    <>
      {createPortal(
        <div
          className={classNameObject({
            "bg-black opacity-[50%] z-[1040] fixed top-0 left-0 right-0 bottom-0": true
          })}
        />,
        document.querySelector("#modal-overlay-container")!!
      )}
      {step &&
        createPortal(
          <div
            className="p-4 border border-[--border-color] bg-white rounded-2xl flex flex-col gap-4 z-[1041]"
            style={popper.styles.popper}
            {...popper.attributes.popper}
            ref={setPopperElement}
          >
            <div className="text-blue-dark-sky text-sm uppercase">{step?.title}</div>
            <div>{step?.message}</div>
            <div className="flex gap-2 mt-4">
              {isFirstStep && (
                <Button onClick={() => prevStep()} outline={true}>
                  Previous
                </Button>
              )}
              {!isLastStep && <Button onClick={() => nextStep()}>Next</Button>}
              {isLastStep && <Button onClick={() => finish()}>Finish</Button>}
            </div>
          </div>,
          document.querySelector("#popper-container")!!
        )}
    </>
  ) : (
    <></>
  );
}

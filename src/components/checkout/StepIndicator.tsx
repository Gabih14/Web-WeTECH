import React from "react";
import { Check } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="w-full py-6">
      {/* Desktop view */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "bg-yellow-400 border-yellow-400 text-gray-900"
                        : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">
                        {step.number}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        isActive || isCompleted
                          ? "text-gray-900"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-xs mt-1 ${
                        isActive || isCompleted
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > step.number
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                    style={{ maxWidth: "100px" }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {steps.map((step) => {
            const isCompleted = currentStep > step.number;
            const isActive = currentStep === step.number;

            return (
              <div
                key={step.number}
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                    ? "bg-yellow-400 border-yellow-400 text-gray-900"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.number}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-gray-900">
            {steps[currentStep - 1].title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {steps[currentStep - 1].description}
          </p>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

export const ErrorState = ({
  title = "Something went wrong",
  message = "We were unable to load this content. Please try again.",
  onRetry,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center border border-red-100 rounded-2xl bg-red-50/10 ${className}`}>
      <div className="p-3 bg-red-50 text-red-600 rounded-full mb-4">
        <AlertCircle size={36} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 font-outfit mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm font-sans mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          iconBefore={<RotateCcw size={16} />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

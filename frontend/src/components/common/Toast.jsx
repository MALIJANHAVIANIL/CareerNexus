import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export const Toast = ({
  message,
  type = "success", // success, warning, error, info
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-200 icon-color-emerald-500",
    warning: "bg-amber-50 text-amber-800 border-amber-200 icon-color-amber-500",
    error: "bg-red-50 text-red-800 border-red-200 icon-color-red-500",
    info: "bg-blue-50 text-blue-800 border-blue-200 icon-color-blue-500"
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  return (
    <div
      className={`fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center p-4 border rounded-xl shadow-lg max-w-sm w-full md:w-auto animate-slide-in-right glass transition-all ${typeStyles[type]}`}
      role="alert"
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 text-sm font-semibold pr-3 font-outfit">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-auto p-1 rounded-md hover:bg-black/5 text-gray-500 transition-colors focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({
  title = "No data found",
  message = "There's nothing here yet.",
  icon = <Inbox size={48} className="text-gray-400" />,
  actionLabel,
  onActionClick,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center border border-dashed border-gray-200 rounded-2xl bg-white/50 ${className}`}>
      <div className="p-4 bg-gray-50 rounded-full mb-4 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 font-outfit mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm font-sans mb-5 leading-relaxed">{message}</p>
      {actionLabel && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-red hover:bg-brand-darkRed transition shadow-sm focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

import React from "react";
import { X, AlertCircle } from "lucide-react";
import Button from "./Button";

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "primary", // primary, danger
  loading = false
}) => {
  if (!isOpen) return null;

  const btnVariants = {
    primary: "primary",
    danger: "danger"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-150 z-10 transform transition-all animate-slide-up scale-100">
        <div className="px-6 py-5 flex items-start gap-4">
          <div className={`p-2 rounded-lg flex-shrink-0 ${variant === "danger" ? "bg-red-50 text-red-600" : "bg-red-50 text-brand-red"}`}>
            <AlertCircle size={24} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 font-outfit mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-sans">{message}</p>
          </div>

          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button 
            variant={btnVariants[variant]} 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

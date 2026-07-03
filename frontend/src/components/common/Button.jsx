import React from "react";

export const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary", // primary, secondary, outline, danger, ghost
  size = "md", // sm, md, lg
  loading = false,
  disabled = false,
  className = "",
  iconBefore = null,
  iconAfter = null,
  fullWidth = false,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-brand-red text-white hover:bg-brand-darkRed shadow-md shadow-red-900/15 focus:ring-brand-red",
    secondary: "bg-brand-black text-white hover:bg-gray-800 shadow-md shadow-gray-900/10 focus:ring-brand-black",
    outline: "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/15 focus:ring-red-500",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs font-semibold",
    md: "px-4 py-2 text-sm font-semibold",
    lg: "px-6 py-3 text-base font-bold"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!loading && iconBefore && <span className="mr-2 inline-flex">{iconBefore}</span>}
      <span>{children}</span>
      {!loading && iconAfter && <span className="ml-2 inline-flex">{iconAfter}</span>}
    </button>
  );
};
export default Button;

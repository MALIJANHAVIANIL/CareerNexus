import React from "react";

export const Card = ({
  children,
  className = "",
  hover = true,
  onClick,
  glass = false,
  ...props
}) => {
  const baseStyles = "rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all duration-300";
  const hoverStyles = hover ? "hover:-translate-y-1 hover:shadow-md hover:border-gray-200" : "";
  const glassStyle = glass ? "glass" : "";
  const cursorStyle = onClick ? "cursor-pointer" : "";

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${glassStyle} ${cursorStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = "", ...props }) => (
  <div className={`px-5 py-4 border-b border-gray-50 bg-white/50 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = "", ...props }) => (
  <div className={`px-5 py-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = "", ...props }) => (
  <div className={`px-5 py-3 border-t border-gray-50 bg-gray-50/50 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;

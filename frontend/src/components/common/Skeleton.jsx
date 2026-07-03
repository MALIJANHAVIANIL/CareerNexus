import React from "react";

export const Skeleton = ({
  variant = "text", // text, circle, rect, card, list
  className = "",
  count = 1
}) => {
  const baseClass = "bg-gray-200 animate-pulse rounded-md";

  const getVariantClass = () => {
    switch (variant) {
      case "circle":
        return "rounded-full h-12 w-12";
      case "text":
        return "h-4 w-3/4 mb-2";
      case "rect":
        return "h-32 w-full";
      default:
        return "h-4 w-full";
    }
  };

  const renderSkeleton = (key) => (
    <div
      key={key}
      className={`${baseClass} ${getVariantClass()} ${className}`}
    />
  );

  if (variant === "card") {
    return (
      <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circle" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-1/2" />
            <Skeleton variant="text" className="w-1/3 h-3" />
          </div>
        </div>
        <Skeleton variant="rect" className="h-24 rounded-lg" />
        <div className="flex justify-between mt-2">
          <Skeleton variant="text" className="w-1/4 h-8" />
          <Skeleton variant="text" className="w-1/4 h-8" />
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center p-3 border-b border-gray-100">
            <Skeleton variant="circle" className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton variant="text" className="w-1/3 mb-1" />
              <Skeleton variant="text" className="w-2/3 h-3 mb-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (count > 1) {
    return (
      <div className="flex flex-col gap-2 w-full">
        {Array.from({ length: count }).map((_, i) => renderSkeleton(i))}
      </div>
    );
  }

  return renderSkeleton(0);
};

export default Skeleton;

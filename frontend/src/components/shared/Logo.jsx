import React from "react";

export const Logo = ({
  size = "md", // sm, md, lg
  showText = true,
  className = "",
  dark = false
}) => {
  const sizes = {
    sm: { icon: "h-8 w-8", text: "text-lg", cap: "-top-1 h-3 w-4", letter: "text-xl", capW: "16px", capH: "12px" },
    md: { icon: "h-11 w-11", text: "text-2xl", cap: "-top-1.5 h-4 w-5", letter: "text-2xl", capW: "20px", capH: "16px" },
    lg: { icon: "h-16 w-16", text: "text-3xl", cap: "-top-2.5 h-6 w-7", letter: "text-4xl", capW: "28px", capH: "24px" }
  };

  const currentSize = sizes[size] || sizes.md;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Logo Icon Container */}
      <div className={`relative ${currentSize.icon} flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100 flex-shrink-0`} style={{ width: size === "sm" ? "32px" : size === "md" ? "44px" : "64px", height: size === "sm" ? "32px" : size === "md" ? "44px" : "64px" }}>
        {/* Black Graduation Cap SVG placed above the C */}
        <div className={`absolute ${currentSize.cap} left-1/2 -translate-x-1/2 z-10 drop-shadow-sm`}>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: currentSize.capW, height: currentSize.capH }}
            className="text-black"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Diamond top */}
            <path d="M12 2L2 7L12 12L22 7L12 2Z" />
            {/* Base skull cap */}
            <path d="M6 10V14.5C6 16.5 9 17.5 12 17.5C15 17.5 18 16.5 18 14.5V10" />
            {/* Tassel */}
            <path d="M18.5 7.5V13.5C18.5 14.3 19.5 14.3 19.5 13.5V7.5" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="19.5" cy="14" r="1" />
          </svg>
        </div>

        {/* Letter C in Bold Dark Red */}
        <span className={`${currentSize.letter} font-extrabold text-brand-red font-outfit select-none relative top-0.5`}>
          C
        </span>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`${currentSize.text} font-outfit font-bold tracking-tight ${dark ? "text-white" : "text-brand-black"}`}>
          Career<span className="text-brand-red font-extrabold">Nexus</span>
        </span>
      )}
    </div>
  );
};

export default Logo;

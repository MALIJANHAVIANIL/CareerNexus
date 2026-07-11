import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  error,
  helperText,
  icon = null,
  required = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);
  const eyeBtnRef = useRef(null);

  const isPassword = type === "password";

  // Revert back to password if focus is lost or user clicks elsewhere
  const handleInputBlur = (e) => {
    if (isPassword) {
      // Small timeout to check if we blurred onto the eye button itself
      setTimeout(() => {
        if (document.activeElement !== eyeBtnRef.current) {
          setShowPassword(false);
        }
      }, 100);
    }
    if (onBlur) onBlur(e);
  };

  // Click-away listener to hide password if visible
  useEffect(() => {
    if (!showPassword) return;

    const handleGlobalClick = (e) => {
      // If the clicked element is no longer in the DOM, it was likely inside our button and got swapped
      if (!document.body.contains(e.target)) {
        return;
      }
      // If click is outside the input and outside the eye button, hide password
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        eyeBtnRef.current &&
        !eyeBtnRef.current.contains(e.target)
      ) {
        setShowPassword(false);
      }
    };

    document.addEventListener("mousedown", handleGlobalClick);
    document.addEventListener("touchstart", handleGlobalClick);
    return () => {
      document.removeEventListener("mousedown", handleGlobalClick);
      document.removeEventListener("touchstart", handleGlobalClick);
    };
  }, [showPassword]);

  // Reveal handlers for toggle interaction
  const handleToggleClick = (e) => {
    e.preventDefault(); // Prevents input focus loss
    setShowPassword((prev) => !prev);
  };

  const handleToggleTouch = (e) => {
    e.preventDefault(); // Prevents mobile touch focus issues
    setShowPassword((prev) => !prev);
  };

  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`flex flex-col w-full ${className}`} style={{ width: "100%" }}>
      {label && (
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700 mb-1.5 font-outfit">
          {label} {required && <span className="text-brand-red">*</span>}
        </label>
      )}
      
      <div className="relative rounded-lg shadow-sm w-full" style={{ width: "100%" }}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          style={{ width: "100%" }}
          ref={inputRef}
          type={currentType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-lg transition-all duration-200 text-sm border-gray-300 focus:ring-brand-red focus:border-brand-red
            ${icon ? "pl-10" : "pl-3.5"}
            ${isPassword ? "pr-10" : "pr-3.5"}
            ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50/20" : "border-gray-300 hover:border-gray-400"}
            py-2.5`}
          {...props}
        />

        {isPassword && (
          <button
            ref={eyeBtnRef}
            type="button"
            onMouseDown={handleToggleClick}
            onTouchStart={handleToggleTouch}
            onClick={(e) => e.preventDefault()}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
            title="Click to toggle password visibility"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs font-semibold text-red-600 animate-fade-in">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};

export default Input;

"use client";

import { useState } from "react";

interface PasswordInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  variant?: "default" | "portal";
  "aria-label"?: string;
}

/**
 * Reusable Password Input with visibility toggle.
 * Supports GearBeat premium dark UI and RTL/LTR layouts.
 */
export function PasswordInput({

  id,
  name,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  minLength,
  autoComplete = "current-password",
  disabled = false,
  className = "",
  inputClassName = "",
  variant = "default",
  "aria-label": ariaLabel,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Variant classes: 'input' for main site, 'gb-input' for portal
  const baseInputClass = variant === "portal" ? "gb-input" : "input";
  const combinedInputClass = `${baseInputClass} ${inputClassName}`.trim();

  return (
    <div className={`password-input-wrapper ${className}`.trim()}>
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        disabled={disabled}
        className={combinedInputClass}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        disabled={disabled}
        title={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>

      <style jsx>{`
        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .password-input-wrapper input {
          padding-right: 48px;
          width: 100%;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
          z-index: 10;
        }

        .password-toggle:hover:not(:disabled) {
          color: #D4AF37;
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .password-toggle svg {
          width: 20px;
          height: 20px;
        }

        /* RTL Handling: Swap padding and icon position */
        :global(html[dir="rtl"]) .password-input-wrapper input {
          padding-right: 16px;
          padding-left: 48px;
        }

        :global(html[dir="rtl"]) .password-toggle {
          right: auto;
          left: 12px;
        }
      `}</style>
    </div>
  );
}

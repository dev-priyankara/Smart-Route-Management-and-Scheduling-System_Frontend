"use client";

import { Search } from "lucide-react";
import { InputHTMLAttributes, forwardRef } from "react";

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ value, onChange, placeholder = "Search...", className = "", ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 py-2.5 text-sm text-[var(--text-secondary)] shadow-sm ${className}`}>
        <Search className="h-4 w-4" />
        <input
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
          {...props}
        />
      </label>
    );
  }
);

SearchField.displayName = "SearchField";
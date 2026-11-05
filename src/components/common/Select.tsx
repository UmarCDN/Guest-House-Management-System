import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  options: SelectOption[];
  icon?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  touched,
  options,
  icon,
  id,
  className = '',
  required,
  ...rest
}) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = touched && !!error;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={selectId} className="form-label fw-medium small mb-1.5 text-secondary">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-group has-validation">
        {icon && (
          <span className="input-group-text bg-light text-muted border-end-0">
            <i className={`bi ${icon}`} />
          </span>
        )}
        <select
          id={selectId}
          className={`form-select ${icon ? 'border-start-0 ps-0' : ''} ${hasError ? 'is-invalid' : ''} ${className}`}
          required={required}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    </div>
  );
};

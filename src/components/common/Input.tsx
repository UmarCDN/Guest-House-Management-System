import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  touched?: boolean;
  helpText?: string;
  icon?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  touched,
  helpText,
  icon,
  id,
  className = '',
  required,
  ...rest
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = touched && !!error;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={inputId} className="form-label fw-medium small mb-1.5 text-secondary">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="input-group has-validation">
        {icon && (
          <span className="input-group-text bg-light text-muted border-end-0">
            <i className={`bi ${icon}`} />
          </span>
        )}
        <input
          id={inputId}
          className={`form-control ${icon ? 'border-start-0 ps-0' : ''} ${hasError ? 'is-invalid' : ''} ${className}`}
          required={required}
          {...rest}
        />
        {hasError && <div className="invalid-feedback d-block">{error}</div>}
      </div>
      {helpText && !hasError && <div className="form-text small text-muted">{helpText}</div>}
    </div>
  );
};

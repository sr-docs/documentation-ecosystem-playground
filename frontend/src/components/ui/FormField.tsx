import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

interface BaseFieldProps {
  label: string
  helperText?: string
  error?: string
}

interface InputFieldProps extends BaseFieldProps, InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'email' | 'password' | 'number'
}

export function InputField({
  label,
  helperText,
  error,
  id: providedId,
  ...props
}: InputFieldProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const helperId = `${id}-helper`
  const errorId = `${id}-error`

  return (
    <div className="artifact-field">
      <label htmlFor={id}>{label}</label>
      {helperText && (
        <span id={helperId} className="field-helper">
          {helperText}
        </span>
      )}
      <input
        id={id}
        aria-describedby={helperText ? helperId : undefined}
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

interface TextareaFieldProps extends BaseFieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextareaField({
  label,
  helperText,
  error,
  id: providedId,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId()
  const id = providedId || generatedId
  const helperId = `${id}-helper`
  const errorId = `${id}-error`

  return (
    <div className="artifact-field">
      <label htmlFor={id}>{label}</label>
      {helperText && (
        <span id={helperId} className="field-helper">
          {helperText}
        </span>
      )}
      <textarea
        id={id}
        aria-describedby={helperText ? helperId : undefined}
        aria-invalid={!!error}
        aria-errormessage={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className="field-error" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

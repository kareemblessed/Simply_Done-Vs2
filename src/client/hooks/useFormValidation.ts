
import React, { useState, useEffect, useCallback } from 'react';

export type ValidationFunction<T> = (values: T) => Record<string, string>;

export interface UseFormValidationProps<T> {
  initialValues: T;
  validate: ValidationFunction<T>;
  onSubmit: (values: T) => Promise<void>;
}

export const useFormValidation = <T extends Record<string, any>>({ 
  initialValues, 
  validate, 
  onSubmit 
}: UseFormValidationProps<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real-time validation on change
  useEffect(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
  }, [values, validate]);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const allTouched = Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
        // Reset form on success
        setValues(initialValues);
        setTouched({});
        setErrors({});
      } catch (error) {
        // Let component handle error display (e.g. global alert)
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const reset = useCallback(() => {
    setValues(initialValues);
    setTouched({});
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
    setValues // Exposed for edge cases or tests
  };
};

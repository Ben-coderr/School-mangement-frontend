import React, { ReactNode } from 'react';

interface InputFieldProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: ReactNode;
  placeholder?: string;
  required?: boolean;
  endAdornment?: ReactNode;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  type,
  label,
  value,
  onChange,
  icon,
  placeholder,
  required,
  endAdornment,
  error,
}) => {
  return (
    <div className="space-y-1">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className={`block w-full rounded-lg py-2.5 
            ${icon ? 'pl-10' : 'pl-4'} 
            ${endAdornment ? 'pr-10' : 'pr-4'} 
            bg-gray-50 border border-gray-300 
            focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
            transition-all duration-200 
            ${error ? 'border-red-500' : ''}
          `}
          placeholder={placeholder}
          required={required}
        />
        
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default InputField;
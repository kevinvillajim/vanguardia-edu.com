import React from 'react';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <h4 className="text-md font-semibold text-gray-800">{title}</h4>
      {children}
    </div>
  );
};

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  className = ''
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

interface CheckboxFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  checked,
  onChange,
  label,
  className = ''
}) => {
  return (
    <label className={`flex items-center space-x-2 ${className}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};
// Common component type definitions

import { ReactNode, ComponentType } from 'react';

// Base types
export interface BaseProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
}

export interface ErrorProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  icon?: ReactNode;
  title?: string;
}

// Media and Asset types
export interface MediaUrlHookOptions {
  mediaType?: 'images' | 'videos' | 'documents';
  courseId?: number;
  unitId?: number;
  enableValidation?: boolean;
  fallbackStrategy?: 'immediate' | 'after-error' | 'never';
}

export interface MediaUrlHookReturn {
  url: string;
  isLoading: boolean;
  hasError: boolean;
  isValidated: boolean;
  retry: () => void;
}

// Logger types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  prefix?: string;
}

export interface LogContext {
  [key: string]: any;
}

// Form and Input types
export interface FormFieldProps extends BaseProps {
  label?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
}

export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  autoComplete?: string;
  maxLength?: number;
}

export interface SelectProps extends FormFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  multiple?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}

// Button types
export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'acent' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Modal and Dialog types
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export interface DialogProps extends ModalProps {
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: 'info' | 'warning' | 'error' | 'success';
}

// Navigation types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
  isActive?: boolean;
}

export interface BreadcrumbProps extends BaseProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
}

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps extends BaseProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

// Data Display types
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => ReactNode;
}

export interface TableProps<T = any> extends BaseProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T, index: number) => void;
  selectedRows?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

// Feedback types
export interface NotificationProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export interface TooltipProps extends BaseProps {
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  delay?: number;
}

export interface ProgressProps extends BaseProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

// Layout types
export interface ContainerProps extends BaseProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  centerContent?: boolean;
}

export interface GridProps extends BaseProps {
  cols?: number | string;
  gap?: number | string;
  responsive?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export interface FlexProps extends BaseProps {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  wrap?: boolean;
  gap?: number | string;
}

// Animation types
export interface AnimationProps {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  duration?: number;
  delay?: number;
  ease?: string;
}

// Accessibility types
export interface AriaProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-disabled'?: boolean;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-live'?: 'off' | 'polite' | 'assertive';
  role?: string;
}

// Theme types
export interface ThemeColors {
  primary: Record<string, string>;
  secondary: Record<string, string>;
  acent: Record<string, string>;
  gray: Record<string, string>;
  success: Record<string, string>;
  warning: Record<string, string>;
  error: Record<string, string>;
  info: Record<string, string>;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  animations: Record<string, string>;
}

// Hook types
export interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export interface UsePaginationReturn {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export interface UseDebounceOptions {
  delay?: number;
  immediate?: boolean;
}

export interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

// Generic utility types
export interface ApiError {
  message: string;
  code?: string | number;
  details?: any;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  key: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
}

// Component composition types
export type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

export type PolymorphicComponentProp<C extends React.ElementType, Props = {}> = React.PropsWithChildren<
  Props & AsProp<C>
> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

export type PolymorphicComponentPropWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProp<C, Props> & { ref?: PolymorphicRef<C> };

type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

// Export utility type for component with displayName
export interface ComponentWithDisplayName<P = {}> extends React.FC<P> {
  displayName?: string;
}
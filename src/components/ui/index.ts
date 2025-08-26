// UI Components Export - Only existing components
// Legacy UI Components (remaining)
export {default as Modal} from "./Modal/Modal";

// Form Components
export {default as FormField} from "./Form/FormField";
export {default as Select} from "./Form/Select";
export {default as Switch} from "./Form/Switch";
export {default as FileUpload} from "./Form/FileUpload";
export {default as ValidatedInput} from "./Form/ValidatedInput";
// export {default as FormExample} from "./Form/FormExample"; // Commented out due to missing useForm hook

// Navigation Components
export {default as Breadcrumbs} from "./Navigation/Breadcrumbs";
export {default as Pagination} from "./Navigation/Pagination";

// State Components
export {default as EmptyState} from "./EmptyState/EmptyState";
export {default as Skeleton} from "./Skeleton/Skeleton";
export {default as SkeletonCard} from "./Skeleton/SkeletonCard";
export {default as SkeletonTable} from "./Skeleton/SkeletonTable";

// Dashboard Components
export {default as StatsCard} from "./Dashboard/StatsCard";
export {default as ChartCard} from "./Dashboard/ChartCard";
export {default as ProgressRing} from "./Dashboard/ProgressRing";
export {default as ActivityFeed} from "./Dashboard/ActivityFeed";

// Theme Components
export {default as ThemeToggle} from "./ThemeToggle";

// Import from shared/components for consolidated components
export { Button } from "../../shared/components";
export { Card, Input, type CardProps, type InputProps } from "../../shared/components/atoms";
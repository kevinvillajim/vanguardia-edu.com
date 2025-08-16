// src/components/ui/Form/FormValidation.js
// Archivo de reexportación para mantener compatibilidad

// Importar desde hooks
export {useForm} from "../../../hooks/useForm";

// Importar desde utils
export {validationRules} from "../../../utils/validation";

// Reexportar componentes de formulario
export {default as ValidatedInput} from "./ValidatedInput";
export {default as FormExample} from "./FormExample";

// Re-exportar FormField para compatibilidad
export {default as FormField} from "./FormField";

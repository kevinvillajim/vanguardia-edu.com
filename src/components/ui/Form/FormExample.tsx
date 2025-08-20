// src/components/ui/Form/FormExample.jsx
import {motion} from "framer-motion";
import {useForm} from "../../../hooks/useForm";
import {validationRules} from "../../../utils/validation";
import FormField from "./FormField";
import Select from "./Select";
import Switch from "./Switch";
import FileUpload from "./FileUpload";
import Button from "@/shared/components/ui/Button/Button";
import Card from "@/shared/components/ui/Card/Card";
import ValidatedInput from "./ValidatedInput";

const FormExample = () => {
	const {
		values,
		errors,
		touched,
		isSubmitting,
		isValid,
		isDirty,
		setFieldValue,
		validateAll,
		resetForm,
		getFieldProps,
		setIsSubmitting,
	} = useForm(
		{
			name: "",
			email: "",
			phone: "",
			password: "",
			confirmPassword: "",
			role: "",
			isActive: true,
			avatar: null,
		},
		{
			name: [
				validationRules.required(),
				validationRules.minLength(
					2,
					"El nombre debe tener al menos 2 caracteres"
				),
			],
			email: [validationRules.required(), validationRules.email()],
			phone: [validationRules.required(), validationRules.phone()],
			password: [
				validationRules.required(),
				validationRules.passwordStrength(),
			],
			confirmPassword: [
				validationRules.required(),
				validationRules.matchField("password", "Las contraseñas no coinciden"),
			],
			role: [validationRules.required("Selecciona un rol")],
		}
	);

	const roleOptions = [
		{value: "admin", label: "Administrador"},
		{value: "teacher", label: "Instructor"},
		{value: "student", label: "Estudiante"},
	];

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateAll()) {
			return;
		}

		setIsSubmitting(true);

		try {
			// Simular llamada a API
			await new Promise((resolve) => setTimeout(resolve, 2000));
			console.log("Form submitted:", values);
			alert("Usuario creado exitosamente!");
			resetForm();
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Card className="max-w-2xl mx-auto">
			<div className="p-6">
				<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
					Ejemplo de Formulario Validado
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Name Field */}
					<ValidatedInput
						label="Nombre completo"
						required
						placeholder="Ingresa tu nombre"
						fieldProps={getFieldProps("name")}
					/>

					{/* Email Field */}
					<ValidatedInput
						type="email"
						label="Correo electrónico"
						required
						placeholder="tu@email.com"
						fieldProps={getFieldProps("email")}
					/>

					{/* Phone Field */}
					<ValidatedInput
						type="tel"
						label="Teléfono"
						required
						placeholder="+593 99 123 4567"
						helper="Formato: +593 99 123 4567"
						fieldProps={getFieldProps("phone")}
					/>

					{/* Password Field */}
					<ValidatedInput
						type="password"
						label="Contraseña"
						required
						placeholder="••••••••"
						helper="Mínimo 8 caracteres, debe incluir mayúsculas, minúsculas y números"
						fieldProps={getFieldProps("password")}
					/>

					{/* Confirm Password Field */}
					<ValidatedInput
						type="password"
						label="Confirmar contraseña"
						required
						placeholder="••••••••"
						fieldProps={getFieldProps("confirmPassword")}
					/>

					{/* Role Select */}
					<FormField
						label="Rol"
						required
						error={touched.role ? errors.role : ""}
					>
						<Select
							options={roleOptions}
							value={values.role}
							onChange={(value) => setFieldValue("role", value)}
							placeholder="Selecciona un rol"
						/>
					</FormField>

					{/* Active Switch */}
					<FormField
						label="Usuario activo"
						helper="Los usuarios inactivos no pueden acceder al sistema"
					>
						<Switch
							checked={values.isActive}
							onChange={(checked) => setFieldValue("isActive", checked)}
						/>
					</FormField>

					{/* Avatar Upload */}
					<FormField
						label="Foto de perfil"
						helper="Sube una imagen JPG, PNG o GIF (máximo 5MB)"
					>
						<FileUpload
							accept="image/jpeg,image/png,image/gif"
							maxSize={5 * 1024 * 1024}
							onFileSelect={(file) => setFieldValue("avatar", file)}
							placeholder="Arrastra una imagen aquí o haz clic para seleccionar"
						/>
					</FormField>

					{/* Submit Button */}
					<div className="flex space-x-4 pt-6">
						<Button
							type="button"
							variant="outline"
							onClick={resetForm}
							disabled={!isDirty || isSubmitting}
							fullWidth
						>
							Limpiar
						</Button>
						<Button
							type="submit"
							variant="primary"
							loading={isSubmitting}
							disabled={!isValid || isSubmitting}
							fullWidth
						>
							{isSubmitting ? "Creando..." : "Crear Usuario"}
						</Button>
					</div>

					{/* Form State Debug Info */}
					{import.meta.env.NODE_ENV === "development" && (
						<motion.div
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
						>
							<h4 className="font-semibold mb-2">
								Estado del formulario (Debug):
							</h4>
							<div className="space-y-1">
								<div>Valid: {isValid ? "✅" : "❌"}</div>
								<div>Dirty: {isDirty ? "✅" : "❌"}</div>
								<div>Submitting: {isSubmitting ? "⏳" : "✅"}</div>
								<div>Errors: {Object.keys(errors).length}</div>
								<div>Touched: {Object.keys(touched).length}</div>
							</div>
						</motion.div>
					)}
				</form>
			</div>
		</Card>
	);
};


export default FormExample;
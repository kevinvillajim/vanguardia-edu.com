import { Input } from "@/shared/components/ui";
import FormField from "./FormField";
import PropTypes from "prop-types";

const ValidatedInput = ({
	label,
	helper,
	required = false,
	fieldProps,
	className = "",
	...inputProps
}) => {
	return (
		<FormField
			label={label}
			helper={helper}
			required={required}
			error={fieldProps.error}
			className={className}
		>
			<Input {...inputProps} {...fieldProps} />
		</FormField>
	);
};

ValidatedInput.propTypes = {
	label: PropTypes.string,
	helper: PropTypes.string,
	required: PropTypes.bool,
	fieldProps: PropTypes.object.isRequired,
	className: PropTypes.string,
};

export default ValidatedInput;
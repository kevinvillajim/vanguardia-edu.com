// src/components/ui/Input/Input.jsx
import {forwardRef} from "react";
import PropTypes from "prop-types";

const Input = forwardRef(
	(
		{label, error, helper, leftIcon, rightIcon, className = "", ...props},
		ref
	) => {
		const inputClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
    bg-white dark:bg-gray-800 
    text-gray-900 dark:text-white
    placeholder-gray-500 dark:placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
    ${
			error
				? "border-red-500 focus:border-red-500"
				: "border-gray-200 dark:border-gray-600 focus:border-blue-500"
		}
    ${leftIcon ? "pl-12" : ""}
    ${rightIcon ? "pr-12" : ""}
    ${className}
  `;

		return (
			<div className="space-y-2">
				{label && (
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
						{label}
					</label>
				)}

				<div className="relative">
					{leftIcon && (
						<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							{leftIcon}
						</div>
					)}

					<input ref={ref} className={inputClasses} {...props} />

					{rightIcon && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
							{rightIcon}
						</div>
					)}
				</div>

				{error && (
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				)}

				{helper && !error && (
					<p className="text-sm text-gray-500 dark:text-gray-400">{helper}</p>
				)}
			</div>
		);
	}
);

Input.displayName = "Input";

Input.propTypes = {
	label: PropTypes.string,
	error: PropTypes.string,
	helper: PropTypes.string,
	leftIcon: PropTypes.node,
	rightIcon: PropTypes.node,
	className: PropTypes.string,
};


export default Input
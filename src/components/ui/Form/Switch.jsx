// src/components/ui/Form/Switch.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const Switch = ({
    checked = false,
    onChange,
    disabled = false,
    size = "md",
    color = "blue",
    className = "",
}) => {
    const sizes = {
        sm: {wrapper: "w-10 h-6", thumb: "w-4 h-4", translate: "translate-x-4"},
        md: {wrapper: "w-12 h-7", thumb: "w-5 h-5", translate: "translate-x-5"},
        lg: {wrapper: "w-14 h-8", thumb: "w-6 h-6", translate: "translate-x-6"},
    };

    const colors = {
        blue: "bg-blue-600",
        green: "bg-green-600",
        purple: "bg-purple-600",
        red: "bg-red-600",
        orange: "bg-orange-600",
    };

    const sizeConfig = sizes[size];
    const activeColor = colors[color];

    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`
        relative inline-flex items-center ${sizeConfig.wrapper} rounded-full 
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${checked ? activeColor : "bg-gray-200 dark:bg-gray-700"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
        >
            <motion.span
                initial={false}
                animate={{
                    x: checked ? sizeConfig.translate.replace("translate-x-", "") : "0px",
                }}
                transition={{type: "spring", stiffness: 500, damping: 30}}
                className={`
          inline-block ${sizeConfig.thumb} rounded-full bg-white shadow-lg 
          transform transition-transform
        `}
            />
        </button>
    );
};

Switch.propTypes = {
    checked: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    color: PropTypes.oneOf(["blue", "green", "purple", "red", "orange"]),
    className: PropTypes.string,
};

export default Switch;
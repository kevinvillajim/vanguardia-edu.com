// src/components/ui/Form/Select.jsx
import {useState, useRef, useEffect} from "react";
import {motion, AnimatePresence} from "framer-motion";
import PropTypes from "prop-types";

const Select = ({
    options = [],
    value,
    onChange,
    placeholder = "Seleccionar...",
    disabled = false,
    className = "",
    multiple = false,
    searchable = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const selectRef = useRef(null);

    const filteredOptions = searchable
        ? options.filter((option) =>
                option.label.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : options;

    const selectedOption = multiple
        ? options.filter((opt) => value?.includes(opt.value))
        : options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        if (multiple) {
            const newValue = value?.includes(option.value)
                ? value.filter((v) => v !== option.value)
                : [...(value || []), option.value];
            onChange(newValue);
        } else {
            onChange(option.value);
            setIsOpen(false);
        }
    };

    const getDisplayValue = () => {
        if (multiple && selectedOption?.length > 0) {
            return selectedOption.length === 1
                ? selectedOption[0].label
                : `${selectedOption.length} seleccionados`;
        }
        return selectedOption?.label || placeholder;
    };

    return (
        <div ref={selectRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          w-full px-4 py-3 text-left bg-white dark:bg-gray-800 
          border-2 border-gray-200 dark:border-gray-600 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          transition-all duration-200
          ${
                        disabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:border-gray-300 dark:hover:border-gray-500"
                    }
          ${isOpen ? "border-blue-500" : ""}
        `}
            >
                <div className="flex items-center justify-between">
                    <span
                        className={`${
                            !selectedOption || (multiple && (!value || value.length === 0))
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-gray-900 dark:text-white"
                        }`}
                    >
                        {getDisplayValue()}
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{opacity: 0, y: -10, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: -10, scale: 0.95}}
                        transition={{duration: 0.2}}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-hidden"
                    >
                        {searchable && (
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        )}

                        <div className="max-h-48 overflow-y-auto">
                            {filteredOptions.length === 0 ? (
                                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                                    No se encontraron opciones
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = multiple
                                        ? value?.includes(option.value)
                                        : value === option.value;

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option)}
                                            className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 
                        transition-colors flex items-center justify-between
                        ${
                                                    isSelected
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                                        : "text-gray-900 dark:text-white"
                                                }
                      `}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected && (
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

Select.propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
                .isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.array,
    ]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
};

export default Select;
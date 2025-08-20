// src/components/ui/Navigation/Tabs.jsx
import {useState} from "react";
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const Tabs = ({
	tabs,
	defaultTab = 0,
	variant = "default",
	size = "md",
	className = "",
	onChange,
}) => {
	const [activeTab, setActiveTab] = useState(defaultTab);

	const handleTabChange = (index) => {
		setActiveTab(index);
		onChange?.(index, tabs[index]);
	};

	const variants = {
		default: "border-b border-gray-200 dark:border-gray-700",
		pills: "bg-gray-100 dark:bg-gray-800 rounded-xl p-1",
		buttons: "space-x-2",
	};

	const sizes = {
		sm: "text-sm",
		md: "text-base",
		lg: "text-lg",
	};

	const tabBaseClasses = `
    relative transition-all duration-200 font-medium cursor-pointer
    ${sizes[size]}
  `;

	const getTabClasses = (index, isActive) => {
		const base = tabBaseClasses;

		switch (variant) {
			case "pills":
				return `${base} px-4 py-2 rounded-lg ${
					isActive
						? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
						: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
				}`;

			case "buttons":
				return `${base} px-4 py-2 rounded-lg border ${
					isActive
						? "bg-blue-600 text-white border-blue-600"
						: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
				}`;

			default:
				return `${base} px-4 py-3 border-b-2 ${
					isActive
						? "border-blue-600 text-blue-600 dark:text-blue-400"
						: "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
				}`;
		}
	};

	return (
		<div className={className}>
			{/* Tab Navigation */}
			<div className={`flex ${variants[variant]}`}>
				{tabs.map((tab, index) => (
					<button
						key={index}
						onClick={() => handleTabChange(index)}
						className={getTabClasses(index, activeTab === index)}
						disabled={tab.disabled}
					>
						<div className="flex items-center space-x-2">
							{tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
							<span>{tab.label}</span>
							{tab.badge && (
								<span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
									{tab.badge}
								</span>
							)}
						</div>
					</button>
				))}
			</div>

			{/* Tab Content */}
			<div className="mt-6">
				{tabs.map((tab, index) => (
					<motion.div
						key={index}
						initial={false}
						animate={{
							opacity: activeTab === index ? 1 : 0,
							y: activeTab === index ? 0 : 10,
						}}
						transition={{duration: 0.2}}
						className={activeTab === index ? "block" : "hidden"}
					>
						{tab.content}
					</motion.div>
				))}
			</div>
		</div>
	);
};

Tabs.propTypes = {
	tabs: PropTypes.arrayOf(
		PropTypes.shape({
			label: PropTypes.string.isRequired,
			content: PropTypes.node.isRequired,
			icon: PropTypes.node,
			badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			disabled: PropTypes.bool,
		})
	).isRequired,
	defaultTab: PropTypes.number,
	variant: PropTypes.oneOf(["default", "pills", "buttons"]),
	size: PropTypes.oneOf(["sm", "md", "lg"]),
	className: PropTypes.string,
	onChange: PropTypes.func,
};

export default Tabs;
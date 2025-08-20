// src/components/ui/Skeleton/Skeleton.jsx
import {motion} from "framer-motion";
import PropTypes from "prop-types";

const Skeleton = ({
    width = "100%",
    height = "1rem",
    className = "",
    variant = "rectangular",
    animation = true,
}) => {
    const variants = {
        rectangular: "rounded-md",
        circular: "rounded-full",
        text: "rounded-md",
    };

    const shimmer = {
        animate: {
            backgroundPosition: ["200% 0", "-200% 0"],
        },
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear",
        },
    };

    return (
        <motion.div
            className={`
        bg-gray-200 dark:bg-gray-700 ${variants[variant]} ${className}
        ${
                    animation
                        ? "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]"
                        : ""
                }
      `}
            style={{width, height}}
            {...(animation ? shimmer : {})}
        />
    );
};

Skeleton.propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    variant: PropTypes.oneOf(["rectangular", "circular", "text"]),
    animation: PropTypes.bool,
};

export default Skeleton;
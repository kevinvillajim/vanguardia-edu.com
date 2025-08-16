import {fontFamily} from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				primary: {
					50: "#f3f0fd",
					100: "#e8e1fb",
					200: "#d4c7f7",
					300: "#b9a3f0",
					400: "#9775e6",
					500: "#5D3FD3", // púrpura profundo principal
					600: "#4f35b8",
					700: "#422c9e",
					800: "#372584",
					900: "#2d1e6a",
					950: "#1f1347",
				},
				secondary: {
					50: "#f9f5fc",
					100: "#f3ebf9",
					200: "#e7d7f3", 
					300: "#CDB4DB", // lila suave principal
					400: "#c19ed6",
					500: "#b088d1",
					600: "#9f72cc",
					700: "#8e5cc7",
					800: "#7d46c2",
					900: "#6c30bd",
					950: "#5b1ab8",
				},
				acent: {
					50: "#fff7ed",
					100: "#ffedd5",
					200: "#fed7aa",
					300: "#fdba74",
					400: "#fb923c",
					500: "#FF9F1C", // naranja brillante principal
					600: "#ea580c",
					700: "#c2410c",
					800: "#9a3412",
					900: "#7c2d12",
					950: "#431407",
				},
				success: {
					50: "#f0fdf4",
					100: "#dcfce7",
					200: "#bbf7d0",
					300: "#86efac",
					400: "#4ade80",
					500: "#22c55e",
					600: "#16a34a",
					700: "#15803d",
					800: "#166534",
					900: "#14532d",
					950: "#052e16",
				},
				warning: {
					50: "#fffbeb",
					100: "#fef3c7",
					200: "#fde68a",
					300: "#fcd34d",
					400: "#fbbf24",
					500: "#f59e0b",
					600: "#d97706",
					700: "#b45309",
					800: "#92400e",
					900: "#78350f",
					950: "#451a03",
				},
				error: {
					50: "#fef2f2",
					100: "#fee2e2",
					200: "#fecaca",
					300: "#fca5a5",
					400: "#f87171",
					500: "#ef4444",
					600: "#dc2626",
					700: "#b91c1c",
					800: "#991b1b",
					900: "#7f1d1d",
					950: "#450a0a",
				},
				neutral: {
					50: "#FFFFFF", // blanco principal
					100: "#f9fafb",
					200: "#f3f4f6",
					300: "#d1d5db",
					400: "#9ca3af",
					500: "#6b7280",
					600: "#4b5563",
					700: "#374151",
					800: "#1f2937",
					900: "#212121", // gris antracita
					950: "#0f0f0f",
				},
			},
			fontFamily: {
				sans: ["Inter", ...fontFamily.sans],
				mono: ["JetBrains Mono", ...fontFamily.mono],
			},
			fontSize: {
				"2xs": ["0.625rem", {lineHeight: "1rem"}],
				xs: ["0.75rem", {lineHeight: "1rem"}],
				sm: ["0.875rem", {lineHeight: "1.25rem"}],
				base: ["1rem", {lineHeight: "1.5rem"}],
				lg: ["1.125rem", {lineHeight: "1.75rem"}],
				xl: ["1.25rem", {lineHeight: "1.75rem"}],
				"2xl": ["1.5rem", {lineHeight: "2rem"}],
				"3xl": ["1.875rem", {lineHeight: "2.25rem"}],
				"4xl": ["2.25rem", {lineHeight: "2.5rem"}],
				"5xl": ["3rem", {lineHeight: "1"}],
				"6xl": ["3.75rem", {lineHeight: "1"}],
				"7xl": ["4.5rem", {lineHeight: "1"}],
				"8xl": ["6rem", {lineHeight: "1"}],
				"9xl": ["8rem", {lineHeight: "1"}],
			},

			// Espaciado extendido
			spacing: {
				18: "4.5rem",
				88: "22rem",
				128: "32rem",
				144: "36rem",
			},

			// Bordes redondeados modernos
			borderRadius: {
				"4xl": "2rem",
				"5xl": "2.5rem",
				"6xl": "3rem",
			},

			// Sombras modernas
			boxShadow: {
				xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
				xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
				"2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
				"3xl": "0 35px 60px -12px rgba(0, 0, 0, 0.3)",
				inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
				"inner-lg": "inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)",
				// Sombras de colores Cooprogreso
				primary:
					"0 10px 15px -3px rgba(149, 193, 31, 0.4), 0 4px 6px -4px rgba(149, 193, 31, 0.1)",
				secondary:
					"0 10px 15px -3px rgba(159, 200, 181, 0.4), 0 4px 6px -4px rgba(159, 200, 181, 0.1)",
				success:
					"0 10px 15px -3px rgba(149, 193, 31, 0.4), 0 4px 6px -4px rgba(149, 193, 31, 0.1)",
				warning:
					"0 10px 15px -3px rgba(245, 158, 11, 0.4), 0 4px 6px -4px rgba(245, 158, 11, 0.1)",
				error:
					"0 10px 15px -3px rgba(239, 68, 68, 0.4), 0 4px 6px -4px rgba(239, 68, 68, 0.1)",
			},

			// Gradientes personalizados
			backgroundImage: {
				"gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
				"gradient-conic":
					"conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
				"gradient-primary": "linear-gradient(135deg, #5D3FD3 0%, #2d1e6a 100%)",
				"gradient-secondary":
					"linear-gradient(135deg, #CDB4DB 0%, #5D3FD3 100%)",
				"gradient-acent": "linear-gradient(135deg, #FF9F1C 0%, #ea580c 100%)",
				"gradient-success": "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
				"gradient-warning": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
				"gradient-error": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
				"gradient-dark": "linear-gradient(135deg, #2d1e6a 0%, #1f1347 100%)",
				"gradient-light": "linear-gradient(135deg, #FFFFFF 0%, #f9f5fc 100%)",
			},

			// Animaciones personalizadas
			animation: {
				"fade-in": "fadeIn 0.5s ease-out",
				"fade-out": "fadeOut 0.5s ease-out",
				"slide-up": "slideUp 0.5s ease-out",
				"slide-down": "slideDown 0.3s ease-out",
				"slide-left": "slideLeft 0.3s ease-out",
				"slide-right": "slideRight 0.3s ease-out",
				"scale-in": "scaleIn 0.3s ease-out",
				"scale-out": "scaleOut 0.3s ease-out",
				"bounce-in": "bounceIn 0.6s ease-out",
				"pulse-soft": "pulseSoft 2s infinite",
				shimmer: "shimmer 2s infinite linear",
				float: "float 3s ease-in-out infinite",
				wiggle: "wiggle 1s ease-in-out infinite",
			},

			keyframes: {
				fadeIn: {
					"0%": {opacity: "0"},
					"100%": {opacity: "1"},
				},
				fadeOut: {
					"0%": {opacity: "1"},
					"100%": {opacity: "0"},
				},
				slideUp: {
					"0%": {transform: "translateY(20px)", opacity: "0"},
					"100%": {transform: "translateY(0)", opacity: "1"},
				},
				slideDown: {
					"0%": {transform: "translateY(-20px)", opacity: "0"},
					"100%": {transform: "translateY(0)", opacity: "1"},
				},
				slideLeft: {
					"0%": {transform: "translateX(20px)", opacity: "0"},
					"100%": {transform: "translateX(0)", opacity: "1"},
				},
				slideRight: {
					"0%": {transform: "translateX(-20px)", opacity: "0"},
					"100%": {transform: "translateX(0)", opacity: "1"},
				},
				scaleIn: {
					"0%": {transform: "scale(0.95)", opacity: "0"},
					"100%": {transform: "scale(1)", opacity: "1"},
				},
				scaleOut: {
					"0%": {transform: "scale(1)", opacity: "1"},
					"100%": {transform: "scale(0.95)", opacity: "0"},
				},
				bounceIn: {
					"0%": {transform: "scale(0.3)", opacity: "0"},
					"50%": {transform: "scale(1.05)"},
					"70%": {transform: "scale(0.9)"},
					"100%": {transform: "scale(1)", opacity: "1"},
				},
				pulseSoft: {
					"0%, 100%": {opacity: "1"},
					"50%": {opacity: "0.7"},
				},
				shimmer: {
					"0%": {backgroundPosition: "-1000px 0"},
					"100%": {backgroundPosition: "1000px 0"},
				},
				float: {
					"0%, 100%": {transform: "translateY(0px)"},
					"50%": {transform: "translateY(-10px)"},
				},
				wiggle: {
					"0%, 100%": {transform: "rotate(-3deg)"},
					"50%": {transform: "rotate(3deg)"},
				},
			},

			// Transiciones personalizadas
			transitionDuration: {
				400: "400ms",
				600: "600ms",
				800: "800ms",
				900: "900ms",
			},

			transitionTimingFunction: {
				"bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
				"bounce-out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
			},

			// Líneas de altura
			lineHeight: {
				12: "3rem",
				14: "3.5rem",
				16: "4rem",
			},

			// Z-index
			zIndex: {
				60: "60",
				70: "70",
				80: "80",
				90: "90",
				100: "100",
			},

			// Filtros y efectos
			backdropBlur: {
				xs: "2px",
			},

			// Grid
			gridTemplateColumns: {
				16: "repeat(16, minmax(0, 1fr))",
				20: "repeat(20, minmax(0, 1fr))",
			},

			// Aspect ratios
			aspectRatio: {
				"4/3": "4 / 3",
				"3/2": "3 / 2",
				"2/3": "2 / 3",
				"9/16": "9 / 16",
			},

			// Contenido personalizado
			content: {
				empty: '""',
			},
		},
	},
	plugins: [
		forms({strategy: "class"}),
		typography,
		aspectRatio,
		containerQueries,
		function ({addUtilities, addComponents, theme}) {
			addUtilities({
				".glass": {
					"backdrop-filter": "blur(16px)",
					background: "rgba(255, 255, 255, 0.8)",
					border: "1px solid rgba(205, 180, 219, 0.2)",
				},
				".glass-dark": {
					"backdrop-filter": "blur(16px)",
					background: "rgba(93, 63, 211, 0.8)",
					border: "1px solid rgba(255, 159, 28, 0.2)",
				},
				".gradient-text": {
					background: "linear-gradient(135deg, #5D3FD3 0%, #FF9F1C 100%)",
					"-webkit-background-clip": "text",
					"-webkit-text-fill-color": "transparent",
					"background-clip": "text",
				},
				".animate-float": {
					animation: "float 3s ease-in-out infinite",
				},
			});

			addComponents({
				".btn": {
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					padding: `${theme("spacing.2")} ${theme("spacing.4")}`,
					borderRadius: theme("borderRadius.xl"),
					fontWeight: theme("fontWeight.medium"),
					transition: "all 0.2s ease-in-out",
					outline: "none",
					"&:focus": {
						outline: "none",
						ring: `2px solid ${theme("colors.primary.500")}`,
						ringOffset: "2px",
					},
					"&:disabled": {
						opacity: "0.5",
						cursor: "not-allowed",
					},
				},
				".btn-primary": {
					background: "linear-gradient(135deg, #5D3FD3 0%, #2d1e6a 100%)",
					color: theme("colors.white"),
					boxShadow: "0 10px 15px -3px rgba(93, 63, 211, 0.4), 0 4px 6px -4px rgba(93, 63, 211, 0.1)",
					"&:hover": {
						background: "linear-gradient(135deg, #CDB4DB 0%, #5D3FD3 100%)",
						boxShadow: theme("boxShadow.xl"),
						transform: "translateY(-1px)",
					},
					"&:active": {
						transform: "scale(0.98)",
					},
				},
				".btn-acent": {
					background: "linear-gradient(135deg, #FF9F1C 0%, #ea580c 100%)",
					color: theme("colors.white"),
					boxShadow: "0 10px 15px -3px rgba(255, 159, 28, 0.4), 0 4px 6px -4px rgba(255, 159, 28, 0.1)",
					"&:hover": {
						background: "linear-gradient(135deg, #fb923c 0%, #FF9F1C 100%)",
						boxShadow: theme("boxShadow.xl"),
						transform: "translateY(-1px)",
					},
					"&:active": {
						transform: "scale(0.98)",
					},
				},
				".btn-secondary": {
					background: theme("colors.white"),
					color: theme("colors.primary.500"),
					border: `2px solid ${theme("colors.secondary.300")}`,
					boxShadow: theme("boxShadow.md"),
					"&:hover": {
						background: theme("colors.secondary.300"),
						boxShadow: theme("boxShadow.lg"),
					},
				},
			});
		},
	],
};
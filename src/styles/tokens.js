// src/styles/tokens.js
export const tokens = {
	// Colores principales basados en paleta Cooprogreso
	colors: {
		primary: {
			50: "#e7f1e3",
			100: "#d4e8ca", 
			200: "#b8dba3",
			300: "#9fc8b5",
			400: "#95c11f",
			500: "#95c11f", // verde claro principal
			600: "#7aa319",
			700: "#5f8514",
			800: "#44670f",
			900: "#006938", // verde oscuro
		},
		secondary: {
			50: "#e7f1e3",
			100: "#d4e8ca",
			200: "#b8dba3", 
			300: "#9fc8b5", // verde medio principal
			400: "#85a699",
			500: "#9fc8b5",
			600: "#7aa391",
			700: "#5f7f6d",
			800: "#445b49",
			900: "#006938",
		},
		success: {
			50: "#e7f1e3",
			100: "#d4e8ca",
			200: "#b8dba3",
			300: "#9fc8b5",
			400: "#95c11f",
			500: "#95c11f",
			600: "#7aa319",
			700: "#5f8514",
			800: "#44670f",
			900: "#006938",
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
		},
		neutral: {
			50: "#fefffe", // blanco principal
			100: "#f5f5f5",
			200: "#e5e5e5",
			300: "#d4d4d4",
			400: "#a3a3a3",
			500: "#737373",
			600: "#525252",
			700: "#404040",
			800: "#262626",
			900: "#171717",
		},
	},

	// Tipografía
	typography: {
		fontFamily: {
			sans: [
				"Inter",
				"system-ui",
				"-apple-system",
				"BlinkMacSystemFont",
				"Segoe UI",
				"Roboto",
				"Helvetica Neue",
				"Arial",
				"sans-serif",
			],
			mono: [
				"JetBrains Mono",
				"Consolas",
				"Monaco",
				"Liberation Mono",
				"Lucida Console",
				"monospace",
			],
		},
		fontSize: {
			xs: "0.75rem",
			sm: "0.875rem",
			base: "1rem",
			lg: "1.125rem",
			xl: "1.25rem",
			"2xl": "1.5rem",
			"3xl": "1.875rem",
			"4xl": "2.25rem",
			"5xl": "3rem",
			"6xl": "3.75rem",
		},
		fontWeight: {
			light: 300,
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
			extrabold: 800,
		},
		lineHeight: {
			tight: 1.25,
			snug: 1.375,
			normal: 1.5,
			relaxed: 1.625,
			loose: 2,
		},
	},

	// Espaciado
	spacing: {
		px: "1px",
		0: "0",
		1: "0.25rem",
		2: "0.5rem",
		3: "0.75rem",
		4: "1rem",
		5: "1.25rem",
		6: "1.5rem",
		7: "1.75rem",
		8: "2rem",
		10: "2.5rem",
		12: "3rem",
		16: "4rem",
		20: "5rem",
		24: "6rem",
		32: "8rem",
	},

	// Bordes
	borderRadius: {
		none: "0",
		sm: "0.125rem",
		md: "0.375rem",
		lg: "0.5rem",
		xl: "0.75rem",
		"2xl": "1rem",
		"3xl": "1.5rem",
		full: "9999px",
	},

	// Sombras
	shadows: {
		sm: "0 1px 2px 0 rgba(0, 105, 56, 0.05)",
		md: "0 4px 6px -1px rgba(0, 105, 56, 0.1), 0 2px 4px -1px rgba(0, 105, 56, 0.06)",
		lg: "0 10px 15px -3px rgba(0, 105, 56, 0.1), 0 4px 6px -2px rgba(0, 105, 56, 0.05)",
		xl: "0 20px 25px -5px rgba(0, 105, 56, 0.1), 0 10px 10px -5px rgba(0, 105, 56, 0.04)",
		"2xl": "0 25px 50px -12px rgba(0, 105, 56, 0.25)",
		inner: "inset 0 2px 4px 0 rgba(0, 105, 56, 0.06)",
	},

	// Animaciones
	animation: {
		duration: {
			fast: "150ms",
			normal: "300ms",
			slow: "500ms",
		},
		easing: {
			easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
			easeIn: "cubic-bezier(0.4, 0, 1, 1)",
			easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
			spring: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
		},
	},

	// Breakpoints
	breakpoints: {
		sm: "640px",
		md: "768px",
		lg: "1024px",
		xl: "1280px",
		"2xl": "1536px",
	},
};
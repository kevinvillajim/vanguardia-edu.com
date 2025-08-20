// src/contexts/ThemeContext.jsx
import {createContext, useContext, useEffect, useState} from "react";
import {lightTheme, darkTheme} from "../styles/theme";

const ThemeContext = createContext();

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme debe ser usado dentro de un ThemeProvider");
	}
	return context;
};

export const ThemeProvider = ({children}) => {
	const [isDark, setIsDark] = useState(() => {
		const savedTheme = localStorage.getItem("theme");
		return (
			savedTheme === "dark" ||
			(!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
		);
	});

	const theme = isDark ? darkTheme : lightTheme;

	const toggleTheme = () => {
		setIsDark(!isDark);
	};

	useEffect(() => {
		localStorage.setItem("theme", isDark ? "dark" : "light");
		document.documentElement.classList.toggle("dark", isDark);

		// Actualizar CSS custom properties
		const root = document.documentElement;
		Object.entries(theme.colors).forEach(([key, value]) => {
			root.style.setProperty(`--color-${key}`, value);
		});

		Object.entries(theme.gradients).forEach(([key, value]) => {
			root.style.setProperty(`--gradient-${key}`, value);
		});
	}, [isDark, theme]);

	return (
		<ThemeContext.Provider value={{isDark, toggleTheme, theme}}>
			{children}
		</ThemeContext.Provider>
	);
};
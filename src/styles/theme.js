// src/styles/theme.js
import { tokens } from "./tokens";

export const lightTheme = {
	colors: {
		background: tokens.colors.neutral[50],
		surface: "#ffffff",
		surfaceVariant: tokens.colors.neutral[100],
		primary: tokens.colors.primary[600],
		primaryVariant: tokens.colors.primary[700],
		secondary: tokens.colors.secondary[600],
		text: tokens.colors.neutral[900],
		textSecondary: tokens.colors.neutral[600],
		textMuted: tokens.colors.neutral[500],
		border: tokens.colors.neutral[200],
		borderLight: tokens.colors.neutral[100],
		success: tokens.colors.success[600],
		warning: tokens.colors.warning[500],
		error: tokens.colors.error[600],
		overlay: "rgba(0, 0, 0, 0.4)",
	},
	gradients: {
		primary: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
		secondary: "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)",
		surface: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
	},
};

export const darkTheme = {
	colors: {
		background: tokens.colors.neutral[900],
		surface: tokens.colors.neutral[800],
		surfaceVariant: tokens.colors.neutral[700],
		primary: tokens.colors.primary[500],
		primaryVariant: tokens.colors.primary[600],
		secondary: tokens.colors.secondary[500],
		text: tokens.colors.neutral[50],
		textSecondary: tokens.colors.neutral[300],
		textMuted: tokens.colors.neutral[400],
		border: tokens.colors.neutral[700],
		borderLight: tokens.colors.neutral[600],
		success: tokens.colors.success[500],
		warning: tokens.colors.warning[500],
		error: tokens.colors.error[500],
		overlay: "rgba(0, 0, 0, 0.6)",
	},
	gradients: {
		primary: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
		secondary: "linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)",
		surface: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
	},
};

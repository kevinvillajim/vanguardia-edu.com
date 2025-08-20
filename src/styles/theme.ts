// src/styles/theme.js
import { tokens } from "./tokens";

export const lightTheme = {
	colors: {
		background: tokens.colors.neutral[50],
		surface: "#ffffff",
		surfaceVariant: tokens.colors.secondary[300],
		primary: tokens.colors.primary[500],
		primaryVariant: tokens.colors.primary[600],
		secondary: tokens.colors.secondary[300],
		acent: tokens.colors.acent[500],
		text: tokens.colors.neutral[900],
		textSecondary: tokens.colors.neutral[600],
		textMuted: tokens.colors.neutral[500],
		border: tokens.colors.neutral[200],
		borderLight: tokens.colors.neutral[100],
		success: tokens.colors.success[600],
		warning: tokens.colors.warning[500],
		error: tokens.colors.error[600],
		overlay: "rgba(93, 63, 211, 0.4)",
	},
	gradients: {
		primary: "linear-gradient(135deg, #5D3FD3 0%, #2d1e6a 100%)",
		secondary: "linear-gradient(135deg, #CDB4DB 0%, #5D3FD3 100%)",
		surface: "linear-gradient(135deg, #ffffff 0%, #f9f5fc 100%)",
		acent: "linear-gradient(135deg, #FF9F1C 0%, #ea580c 100%)",
	},
};

export const darkTheme = {
	colors: {
		background: tokens.colors.neutral[900],
		surface: tokens.colors.neutral[800],
		surfaceVariant: tokens.colors.primary[900],
		primary: tokens.colors.primary[400],
		primaryVariant: tokens.colors.primary[500],
		secondary: tokens.colors.secondary[400],
		acent: tokens.colors.acent[400],
		text: tokens.colors.neutral[50],
		textSecondary: tokens.colors.neutral[300],
		textMuted: tokens.colors.neutral[400],
		border: tokens.colors.neutral[700],
		borderLight: tokens.colors.neutral[600],
		success: tokens.colors.success[500],
		warning: tokens.colors.warning[500],
		error: tokens.colors.error[500],
		overlay: "rgba(33, 33, 33, 0.6)",
	},
	gradients: {
		primary: "linear-gradient(135deg, #9775e6 0%, #5D3FD3 100%)",
		secondary: "linear-gradient(135deg, #CDB4DB 0%, #b088d1 100%)",
		surface: "linear-gradient(135deg, #1f2937 0%, #2d1e6a 100%)",
		acent: "linear-gradient(135deg, #fb923c 0%, #FF9F1C 100%)",
	},
};

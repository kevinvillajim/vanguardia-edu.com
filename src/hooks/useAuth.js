// src/hooks/useAuth.js
import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContext";

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth debe ser usado dentro de un AuthProvider");
	}
	return context;
}

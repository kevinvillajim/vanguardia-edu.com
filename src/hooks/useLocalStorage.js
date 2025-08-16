// src/hooks/useLocalStorage.js
import {useState, useEffect, useCallback} from "react";
import {encryptData, decryptData} from "../utils/crypto";

export function useLocalStorage(key, initialValue, encrypted = false) {
	// Función para leer del localStorage
	const readValue = useCallback(() => {
		try {
			const item = window.localStorage.getItem(key);
			if (item === null) return initialValue;

			if (encrypted) {
				return JSON.parse(decryptData(item));
			}

			return JSON.parse(item);
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	}, [key, initialValue, encrypted]);

	// Estado
	const [storedValue, setStoredValue] = useState(readValue);

	// Función para escribir al localStorage
	const setValue = useCallback(
		(value) => {
			try {
				const newValue = value instanceof Function ? value(storedValue) : value;
				setStoredValue(newValue);

				if (encrypted) {
					window.localStorage.setItem(key, encryptData(newValue));
				} else {
					window.localStorage.setItem(key, JSON.stringify(newValue));
				}
			} catch (error) {
				console.warn(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, storedValue, encrypted]
	);

	// Función para remover del localStorage
	const removeValue = useCallback(() => {
		try {
			window.localStorage.removeItem(key);
			setStoredValue(initialValue);
		} catch (error) {
			console.warn(`Error removing localStorage key "${key}":`, error);
		}
	}, [key, initialValue]);

	// Escuchar cambios en localStorage
	useEffect(() => {
		const handleStorageChange = (e) => {
			if (e.key === key && e.newValue !== null) {
				setStoredValue(readValue());
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	}, [key, readValue]);

	return [storedValue, setValue, removeValue];
}

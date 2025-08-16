import CryptoJS from "crypto-js";
import {APP_CONFIG} from "../utils/constants";

// Función para encriptar datos
export function encryptData(data) {
	try {
		return CryptoJS.AES.encrypt(
			JSON.stringify(data),
			APP_CONFIG.SECRET_KEY
		).toString();
	} catch (error) {
		console.error("Error during encryption:", error);
		throw new Error("Failed to encrypt data");
	}
}

// Función para desencriptar datos
export function decryptData(ciphertext) {
	try {
		if (
			!ciphertext ||
			typeof ciphertext !== "string" ||
			ciphertext.trim() === ""
		) {
			console.warn("Invalid ciphertext provided for decryption");
			return null;
		}

		const bytes = CryptoJS.AES.decrypt(ciphertext, APP_CONFIG.SECRET_KEY);

		// Check if decryption resulted in valid bytes before converting to UTF-8
		if (!bytes || bytes.sigBytes <= 0) {
			console.warn("Decryption resulted in invalid bytes");
			return null;
		}

		const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

		if (!decryptedString || decryptedString.trim() === "") {
			console.warn("Decryption resulted in an empty string");
			return null;
		}

		// Validate that the decrypted string is valid JSON
		try {
			return JSON.parse(decryptedString);
		} catch (jsonError) {
			console.error("Decrypted data is not valid JSON:", jsonError);
			return null;
		}
	} catch (error) {
		console.error("Error during decryption:", error);
		return null;
	}
}

// Función para guardar datos en localStorage
export function saveToLocalStorage(key, data) {
	try {
		if (!key || data === undefined || data === null) {
			console.warn(
				`Invalid parameters for saving to localStorage: key=${key}, data=${data}`
			);
			return false;
		}

		const encryptedData = encryptData(data);
		localStorage.setItem(key, encryptedData);
		return true;
	} catch (error) {
		console.error(`Error saving to localStorage for key ${key}:`, error);
		return false;
	}
}

// Función para obtener datos de localStorage
export function getFromLocalStorage(key) {
	try {
		if (!key) {
			console.warn("No key provided for localStorage retrieval");
			return null;
		}

		const encryptedData = localStorage.getItem(key);

		if (!encryptedData || encryptedData.trim() === "") {
			console.warn(
				`No encrypted data found for key: ${key}, or data is empty.`
			);
			return null;
		}

		const decryptedData = decryptData(encryptedData);

		// If decryption fails, clean up the corrupted data
		if (decryptedData === null) {
			console.warn(`Removing corrupted data for key: ${key}`);
			localStorage.removeItem(key);
		}

		return decryptedData;
	} catch (error) {
		console.error(`Error retrieving data for key ${key}:`, error);
		// Clean up corrupted data
		try {
			localStorage.removeItem(key);
		} catch (cleanupError) {
			console.error(
				`Error cleaning up corrupted data for key ${key}:`,
				cleanupError
			);
		}
		return null;
	}
}

// Función para verificar si hay datos válidos en localStorage
export function hasValidData(key) {
	try {
		const data = getFromLocalStorage(key);
		return data !== null && data !== undefined;
	} catch (error) {
		console.error(`Error checking validity for key ${key}:`, error);
		return false;
	}
}

// Función para limpiar datos corruptos del localStorage
export function clearCorruptedData() {
	const keysToCheck = ["user", "expDates", "authToken"]; // Agregar más keys según sea necesario

	keysToCheck.forEach((key) => {
		try {
			const data = getFromLocalStorage(key);
			if (data === null) {
				console.info(`Cleared corrupted data for key: ${key}`);
			}
		} catch (error) {
			console.error(`Error checking key ${key}:`, error);
		}
	});
}

export default {
	encryptData,
	decryptData,
	saveToLocalStorage,
	getFromLocalStorage,
	hasValidData,
	clearCorruptedData,
};

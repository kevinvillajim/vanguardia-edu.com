// src/hooks/useToggle.js
import {useState, useCallback} from "react";

export function useToggle(initialValue = false) {
	const [value, setValue] = useState(initialValue);

	const toggle = useCallback(() => {
		setValue((current) => !current);
	}, []);

	const setTrue = useCallback(() => {
		setValue(true);
	}, []);

	const setFalse = useCallback(() => {
		setValue(false);
	}, []);

	return [value, {toggle, setTrue, setFalse, setValue}];
}

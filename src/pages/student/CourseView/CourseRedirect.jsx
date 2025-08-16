import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import cursos from "../../../utils/cursos";

const CursosRedirect = ({curso}) => {
	const navigate = useNavigate();

	useEffect(() => {
		const initialOpenIndex = localStorage.getItem(
			`Course${curso}initialOpenIndex`
		);

		let url = `/estudiante/cursos/curso${curso + 1}/unidad1`;

		if (initialOpenIndex !== null) {
			const index = parseInt(initialOpenIndex, 10);
			if (cursos[curso] && cursos[curso].units[index]) {
				url = cursos[curso].units[index].url;
			}

			navigate(url);
		} else {
			navigate(`/estudiante/cursos/curso${curso + 1}/unidad1`);
		}
	}, [curso, cursos, navigate]);

	return null; // Este componente no necesita renderizar nada
};

export default CursosRedirect;

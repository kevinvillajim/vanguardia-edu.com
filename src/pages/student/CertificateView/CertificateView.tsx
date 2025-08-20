import Template from "../../../components/layout/Template/Template";
import Certificados from "../../../features/courses/components/Certificate/Certificados";
import cursos from "../../../utils/cursos";
import api from "../../../config/api";
import {useState, useEffect} from "react";
import {getFromLocalStorage} from "../../../utils/crypto";

export default function Certificado({curso}) {
	const [progress, setProgress] = useState(null);
	const [averageScore, setAverageScore] = useState(null);
	const [finishDate, setFinishDate] = useState(null);
	const user = JSON.parse(getFromLocalStorage("user"));

	useEffect(() => {
		if (user && !progress) {
			fetchProgressUser();
		}
	}, [user, progress]);

	const fetchProgressUser = async () => {
		try {
			const response = await api.get("/user-progress");
			const progressData = response.data;
			setProgress(progressData);
			calculateAverageScoreAndFinishDate(progressData);
		} catch (error) {
			console.error(
				"Error Fetching Progress Data:",
				error.response?.data || error.message
			);
		}
	};

	const calculateAverageScoreAndFinishDate = (progressData) => {
		// Filtrar datos del curso específico
		const courseProgress = progressData.filter(
			(item) => parseInt(item.course_id) === curso
		);

		// Calcular el puntaje total y el promedio
		const totalScore = courseProgress.reduce(
			(sum, item) => sum + parseFloat(item.score),
			0
		);
		console.log(totalScore);

		const average =
			courseProgress.length > 0
				? (totalScore / courseProgress.length).toFixed(2)
				: 0;

		setAverageScore(parseFloat(average));

		// Obtener la última fecha de finalización
		if (courseProgress.length > 0) {
			const latestFinishDate = courseProgress.reduce((latest, item) => {
				const currentFinishDate = new Date(item.finishDate);
				return currentFinishDate > latest ? currentFinishDate : latest;
			}, new Date(courseProgress[0].finishDate));
			setFinishDate(latestFinishDate.toISOString().split("T")[0]); // Formatear la fecha como YYYY-MM-DD
		} else {
			setFinishDate(null);
		}
	};

	if (!user || !progress) {
		return (
			<div className="w-screen h-screen flex justify-center items-center">
				<div className="loader-4">
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
					<div className="loader-square"></div>
				</div>
			</div>
		);
	}

	if (typeof curso === "undefined") {
		return <div>Error: Curso no definido</div>;
	}

	return (
		<div>
			<Template
				rol="Estudiante"
				content={
					<Certificados
						userId={user.id}
						courseId={curso}
						name={user.name}
						ci={user.ci}
						course={cursos[curso].title}
						description={cursos[curso].content}
						date={finishDate}
						calification={averageScore}
					/>
				}
			/>
		</div>
	);
}

import Template from "../../../components/layout/Template/Template";
import CourseCard from "../../../features/courses/components/CourseCard/CourseCard";
import cursos from "../../../utils/cursos";
import {getFromLocalStorage} from "../../../utils/crypto";

export default function DashboardEstudiante() {
	const user = getFromLocalStorage("user");
	const expDates = getFromLocalStorage("expDates") || [];
	
	if (!user) {
		setTimeout(() => {
			window.location.reload();
		}, 1000);
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

	const isCourseAvailable = (cursoId) => {
		const expDate = expDates.find(
			(date) => parseInt(date.curso_id) === cursoId
		);
		if (!expDate) {
			return true; // Si no hay fecha de expedición, mostrar el curso
		}
		const currentDate = new Date();
		const deadlineDate = new Date(expDate.dead_line);
		return currentDate <= deadlineDate;
	};

	return (
		<>
			<div>
				<Template
					rol="Estudiante"
					content={
						<div className="flex flex-col md:grid md:grid-cols-4 gap-5">
							{cursos.map((curso, cursoIndex) => {
								let totalSum = curso.units.reduce((accumulator, unit) => {
									const unitProgress = localStorage.getItem(
										`Course${cursoIndex}${unit.value}`
									);
									return (
										accumulator +
										(unitProgress ? parseInt(unitProgress, 10) : 0)
									);
								}, 0);
								let average = totalSum / curso.units.length;
								average = parseInt(average);
								if (isCourseAvailable(cursoIndex)) {
									return (
										<CourseCard
											key={cursoIndex}
											title={curso.title}
											img={curso.img}
											description={curso.content}
											progress={average}
											link={curso.link}
											course={cursoIndex}
										/>
									);
								} else {
									return null; // No mostrar el curso si la fecha actual es posterior a la fecha límite
								}
							})}
						</div>
					}
				/>
			</div>
		</>
	);
}

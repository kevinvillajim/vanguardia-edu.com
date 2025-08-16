import {useEffect, useState} from "react";
import Template from "../../../components/layout/Template/Template";
import Gallery from "../../../components/ui/Gallery/Gallery";
import cursos from "../../../utils/cursos";
import {getFromLocalStorage} from "../../../utils/crypto";
import api from "../../../config/api";

export default function DashboardEstudiante() {
	const user = JSON.parse(getFromLocalStorage("user"));
	const [finishedCourses, setfinishedCourses] = useState([]);

	async function searchIsFinished(id, course) {
		try {
			const response = await api.get(`/progress/student/${id}`);
			const progressById = response.data;
			const isFinished = progressById.filter(
				(item) => item.course_id === String(course)
			);
			if (
				isFinished.length === cursos[course].units.length &&
				isFinished.every((item) => item.completed === "1")
			) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.error(
				"Error Fetching Progress Data:",
				error.response?.data || error.message
			);
			return false;
		}
	}

	useEffect(() => {
		async function checkCoursesCompletition() {
			const finished = [];

			for (let i = 0; i < cursos.length; i++) {
				const isFinished = await searchIsFinished(user.id, i);
				if (isFinished) {
					finished.push(i);
				}
			}
			setfinishedCourses(finished);
		}
		checkCoursesCompletition();
	}, [user.id]);

	if (!user) {
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

	return (
		<>
			<div>
				<Template
					rol="Estudiante"
					content={
						<div className="flex justify-center py-[2rem]">
							{finishedCourses.length > 0 ? (
								<div className="pt-[4rem] md:pt-0 flex flex-col md:flex-row gap-5">
									{cursos.map((curso, index) =>
										finishedCourses.includes(index) ? (
											<a key={index} href={`${curso.link}/certificado`}>
												<Gallery
													imgSrc={curso.img}
													altText={curso.title}
													title={curso.title}
												/>
											</a>
										) : null
									)}
								</div>
							) : (
								<div className="flex justify-center">
									<p>Aún no tienes ningún certificado</p>
								</div>
							)}
						</div>
					}
				/>
			</div>
		</>
	);
}

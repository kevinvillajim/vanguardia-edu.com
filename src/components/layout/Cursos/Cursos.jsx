import SideBarCourse from "../../layout/Sidebar/SideBarCourse";
import HeaderCourse from "../../layout/Header/HeaderCourse";
import ContentCourse from "../../../features/courses/components/CourseContent/ContentCourse";
import {LoadingSpinner} from "../../ui";
import cursos from "../../../utils/cursos";
import {useState} from "react";
import {useCourseAccess} from "../../../hooks/useCourseAccess.jsx";

const Cursos = ({curso, contenido}) => {
	const [showModal, setShowModal] = useState(true);
	const {isLoading, hasAccess} = useCourseAccess(curso);

	// Mostrar loader mientras verifica acceso
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-900 flex items-center justify-center">
				<div className="text-center">
					<LoadingSpinner size="lg" />
					<p className="text-white mt-4">Verificando acceso al curso...</p>
				</div>
			</div>
		);
	}

	// Si no tiene acceso, no renderizar nada (el hook maneja la redirección)
	if (!hasAccess) {
		return null;
	}

	return (
		<>
			<div>
				<HeaderCourse title={cursos[curso].title} />
				<div className="flex">
					<div className={showModal ? "w-[55%] md:w-[30%]" : "hidden"}>
						<SideBarCourse cursos={cursos[curso]} curso={curso} />
					</div>
					<div className="w-[100%] bg-[#191b20]">
						<ContentCourse
							subtitle={cursos[curso].title}
							content={<>{contenido}</>}
							showModal={showModal}
							setShowModal={setShowModal}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default Cursos;

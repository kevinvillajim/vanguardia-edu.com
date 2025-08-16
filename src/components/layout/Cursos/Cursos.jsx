import SideBarCourse from "../../layout/Sidebar/SideBarCourse";
import HeaderCourse from "../../layout/Header/HeaderCourse";
import ContentCourse from "../../../features/courses/components/CourseContent/ContentCourse";
import cursos from "../../../utils/cursos";
import {useState} from "react";

const Cursos = ({curso, contenido}) => {
	const [showModal, setShowModal] = useState(true);
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

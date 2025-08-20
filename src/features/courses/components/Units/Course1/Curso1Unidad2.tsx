import {useRef} from "react";
import Banner from "../../../../../components/ui/Banner/Banner";
import Title from "../../../../../components/ui/Title/Title";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph";
import Image from "../../../../../components/ui/Image/Image";
import List from "../../../../../components/ui/List/List";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz";
import Cursos from "../../../../../components/layout/Cursos/Cursos";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress";
import {Video} from "../../../../../features/courses/components/Video/Video";

export default function Unidad2() {
	const scrollContainerRef = useRef(null);
	const curso = 0;
	const unidad = 2;
	return (
		<>
			<Cursos
				curso={curso}
				contenido={
					<div ref={scrollContainerRef} className="h-[38rem] overflow-auto">
						<ScrollProgress
							scrollContainerRef={scrollContainerRef}
							unit={unidad}
							course={curso}
						/>
						<Banner
							img="/c1Banner2.webp"
							title="Unidad 2: Integrantes del sistema de protección de datos personales"
						/>
						<div id="modulo1">
							<Title title="2.1 Titular" />
						</div>
						<Paragraph p="El titular de datos personales es la persona física a quien pertenecen los datos que están siendo procesados o utilizados por una entidad u organización. Es decir, es la persona a la que se refieren los datos y cuya identidad puede ser determinada o está determinada. Por ejemplo en 'Usuarios de servicios en línea:' Cuando una persona crea una cuenta en una plataforma digital (como redes sociales, servicios de correo electrónico, etc.), se convierte en titular de los datos que proporciona durante el registro." />
						<Image img="/usuario.jpg" />
						<div id="modulo2">
							<Title title="2.2 Responsable de tratamiento de datos personales" />
						</div>
						<Paragraph p="Persona natural o jurídica, pública o privada, u otro organismo, que solo o juntamente con otros decide sobre la finalidad y el tratamiento de datos personales, Es decir, es quien decide cómo y para qué se recogen, utilizan y protegen los datos personales de los individuos." />
						<Paragraph p="El responsable de tratamiento tiene la obligación legal de cumplir con las normativas de protección de datos, asegurando que se respeten los derechos de los titulares de datos y que se implementen medidas adecuadas de seguridad y confidencialidad. Este rol es crucial para garantizar la transparencia y la confianza en el manejo de la información personal en cualquier contexto organizacional." />
						<Image img="/rudp.svg" />
						<div id="modulo3">
							<Title title="2.3 Delegado de protección de datos" />
						</div>
						<Paragraph p="El delegado de protección de datos, también conocido como DPO por sus siglas en inglés (Data Protection Officer), es una figura designada dentro de una organización responsable del monitoreo de la conformidad con las leyes de protección de datos y la política interna de protección de datos personales. El DPD actúa de manera independiente y tiene la responsabilidad de informar y asesorar a la organización sobre sus obligaciones legales en relación con la protección de datos." />
						<Paragraph p="El DPD juega un papel crucial en la promoción de una cultura de protección de datos dentro de la organización, colaborando con equipos internos para implementar políticas y prácticas que salvaguarden la privacidad de los individuos y minimicen los riesgos asociados al tratamiento de datos personales." />
						<Image img="/dpo.webp" />
						<div id="modulo4">
							<Title title="2.4 Encargado del tratamiento de datos personales" />
						</div>
						<Paragraph p="El encargado del tratamiento de datos personales es una entidad externa o interna que procesa datos personales en nombre del responsable del tratamiento. Esta figura es designada por el responsable del tratamiento para realizar operaciones específicas con los datos personales, siguiendo las instrucciones del responsable y bajo un contrato formal que establece las responsabilidades y obligaciones del encargado." />
						<Image img="/etd.jpeg" />
						<div id="modulo5">
							<Title title="2.5 Destinatario " />
						</div>
						<Paragraph p="Un destinatario se refiere a la persona, entidad u organización que recibe los datos personales de parte del responsable del tratamiento o del encargado del tratamiento. Es importante destacar que el destinatario puede ser interno o externo a la organización que origina los datos, dependiendo del flujo de información y las necesidades específicas del tratamiento." />
						<Image img="/terceros.webp" />
						<div id="modulo6">
							<Title title="2.6 Autoridad de Protección de Datos Personales" />
						</div>
						<Paragraph p="La Autoridad de Protección de Datos Personales es una entidad gubernamental u organismo independiente encargado de supervisar y hacer cumplir las leyes de protección de datos dentro de un país o región específica. Su función principal es proteger los derechos de los individuos en relación con el tratamiento de sus datos personales y asegurar que las organizaciones cumplan con las normativas de privacidad establecidas." />
						<Image img="/super.jpeg" />
						<div id="modulo7">
							<Title title="2.7 Consentimiento" />
						</div>
						<Paragraph
							p={
								"Es importante tener muy claro sobre el consentimiento que debe dar el titular para el tratamiento de sus datos personales, para una o varias finalidades específicas. NUESTRA ORGANIZACIÓN, debe tener el consentimiento del titular para poder tratar los datos personales de acuerdo con las siguientes finalidades:"
							}
						/>
						<List
							li={[
								"Gestionar la relación contractual de los productos y servicios que el Interesado solicite o contrate con NUESTRA ORGANIZACIÓN.",
								"Cumplir con las obligaciones legales y normativa aplicable a NUESTRA ORGANIZACIÓN",
								"Elaboración de perfiles comerciales y de riesgos",
								"Ofertas de productos y servicios de NUESTRA ORGANIZACIÓN y/o comercializados por socios comerciales.",
								"Generación y gestión de modelos de análisis.",
								"Consultar a las entidades de información crediticia o buro de crédito",
							]}
						/>

						<div className="flex justify-center">
							<Video
								src="/videos/curso1unidad2video.mp4"
								poster="/videos/curso1unidad2img.jpg"
								title="Ley Orgánica de protección de datos Ecuador"
							/>
						</div>
						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question:
										"¿Una persona natural puede cumplir el rol de Responsable de Tratamiento de Datos Personales (RTDP)?",
									options: ["Verdadero", "Falso"],
									answer: 1,
								},
								{
									question:
										"¿Qué se requiere para que una organización trate los datos personales de un titular?",
									options: [
										"El consentimiento del titular para una o varias finalidades específicas.",
										"La aprobación de un delegado de protección de datos.",
										"La supervisión directa de una autoridad de protección de datos.",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué es un destinatario en el contexto del tratamiento de datos personales?",
									options: [
										"La persona física a quien pertenecen los datos personales.",
										"La entidad que decide sobre la finalidad y el tratamiento de los datos personales.",
										"La persona, entidad u organización que recibe los datos personales de parte del responsable del tratamiento o del encargado del tratamiento.",
									],
									answer: 3,
								},
								{
									question:
										"¿Cuál es la función principal del Delegado de Protección de Datos (DPD)?",
									options: [
										"Procesar los datos personales en nombre del responsable del tratamiento.",
										"Monitorear la conformidad con las leyes de protección de datos y la política interna de protección de datos personales.",
										"Recibir y almacenar datos personales de los usuarios.",
									],
									answer: 2,
								},
							]}
						/>
					</div>
				}
			/>
		</>
	);
}

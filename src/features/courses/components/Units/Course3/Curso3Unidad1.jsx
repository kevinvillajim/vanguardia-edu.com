import {useRef, useState} from "react";
import Banner from "../../../../../components/ui/Banner/Banner.jsx";
import Title from "../../../../../components/ui/Title/Title.jsx";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph.jsx";
import Image from "../../../../../components/ui/Image/Image.jsx";
import List from "../../../../../components/ui/List/List.jsx";
import Quiz from "../../Quiz/Quiz.jsx";
import Cursos from "../../../../../components/layout/Cursos/Cursos.jsx";
import ScrollProgress from "../../ScrollProgress/ScrollProgress.jsx";
import {Video} from "../../Video/Video.jsx";

export default function Unidad1() {
	const [showModal, setShowModal] = useState(false);
	const scrollContainerRef = useRef(null);
	const curso = 2;
	const unidad = 1;
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
							img="/c3Banner1.jpg"
							title="Unidad 1: Introducción a la Ciberseguridad en Cooperativas"
						/>
						<div id="modulo1">
							<Title title="1.1 Conceptos Básicos de Ciberseguridad" />
						</div>
						<Paragraph p="La ciberseguridad se define como la práctica de proteger los sistemas informáticos, redes, dispositivos y datos frente a accesos no autorizados, daños, interrupciones o cualquier tipo de ataque malicioso. En el contexto de las cooperativas, esto incluye la protección de información financiera de los socios, datos personales, sistemas de gestión y plataformas digitales de servicios." />
						<Paragraph p="Los tres pilares fundamentales de la seguridad de la información son: Confidencialidad (asegurar que la información solo sea accesible para personas autorizadas), Integridad (garantizar que los datos no sean alterados de forma no autorizada) y Disponibilidad (asegurar que los sistemas y datos estén disponibles cuando se necesiten)." />
						<Image
							img="/hacker.jpg"
							showModal={showModal}
							setShowModal={setShowModal}
						/>
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad1video1.mp4"
								poster="/videos/curso3unidad1img1.png"
								title="Fundamentos de Ciberseguridad"
							/>
						</div>
						<div id="modulo2">
							<Title title="1.2 Importancia en el Sector Cooperativo" />
						</div>
						<Paragraph p="Las cooperativas financieras manejan información altamente sensible de sus socios, incluyendo datos personales, información financiera, historial crediticio y transacciones. Esta información es extremadamente valiosa para los ciberdelincuentes, quienes pueden utilizarla para cometer fraudes, robo de identidad o extorsión." />
						<Paragraph p="La confianza es el activo más importante de una cooperativa. Los socios depositan su confianza en la institución para proteger sus ahorros e información personal. Un incidente de ciberseguridad puede dañar irreparablemente esta confianza, resultando en pérdida de socios, problemas regulatorios y daño reputacional." />
						<List
							li={[
								"Las cooperativas procesan miles de transacciones diarias a través de canales digitales",
								"Manejan información personal y financiera de cientos o miles de socios",
								"Utilizan sistemas interconectados que pueden ser vulnerables a ataques",
								"Son objetivos atractivos para ciberdelincuentes debido a los recursos financieros que manejan",
								"Deben cumplir con regulaciones estrictas de protección de datos"
							]}
						/>
						<Image
							img="/bancaMovil.jpg"
							showModal={showModal}
							setShowModal={setShowModal}
						/>
						<div id="modulo3">
							<Title title="1.3 Principales Amenazas Actuales" />
						</div>
						<Paragraph p="El panorama de amenazas cibernéticas evoluciona constantemente. Las cooperativas enfrentan diversos tipos de ataques que pueden comprometer su seguridad y la de sus socios. Es fundamental conocer estas amenazas para poder defenderse adecuadamente." />
						<List
							li={[
								"Phishing: Correos electrónicos o mensajes fraudulentos que intentan obtener credenciales de acceso",
								"Ransomware: Software malicioso que cifra archivos y exige un rescate para liberarlos",
								"Ataques a la banca móvil: Intentos de comprometer aplicaciones móviles bancarias",
								"Fraude en transacciones: Manipulación de sistemas de pago para realizar transferencias no autorizadas",
								"Ingeniería social: Manipulación psicológica de empleados para obtener acceso a sistemas",
								"Ataques DDoS: Saturación de servidores para interrumpir servicios digitales"
							]}
						/>
						<Image
							img="/phishingCoop.jpg"
							showModal={showModal}
							setShowModal={setShowModal}
		/>
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad1video2.mp4"
								poster="/videos/curso3unidad1img2.png"
								title="Tipos de Ataques Comunes"
							/>
						</div>
						<Paragraph p="Según estudios recientes, el 78% de las instituciones financieras ha experimentado al menos un intento de ciberataque en el último año. Las cooperativas, al igual que los bancos tradicionales, deben implementar medidas robustas de ciberseguridad para proteger a sus socios y cumplir con las regulaciones aplicables." />
						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question: "¿Qué busca proteger la ciberseguridad en una cooperativa?",
									options: [
										"Solo los sistemas físicos",
										"La información y los sistemas frente a accesos no autorizados",
										"El acceso a redes sociales"
									],
									answer: 2,
								},
								{
									question: "¿Qué representa el principio de 'disponibilidad' en la seguridad de la información?",
									options: [
										"Que los datos estén cifrados",
										"Que los datos estén siempre accesibles cuando se necesiten",
										"Que los datos no se compartan"
									],
									answer: 2,
								},
								{
									question: "¿Por qué son las cooperativas objetivos atractivos para ciberdelincuentes?",
									options: [
										"Porque no tienen sistemas de seguridad",
										"Porque manejan información financiera valiosa y recursos económicos",
										"Porque son empresas pequeñas"
									],
									answer: 2,
								},
								{
									question: "¿Cuál es el activo más importante de una cooperativa en términos de ciberseguridad?",
									options: [
										"Los equipos informáticos",
										"La confianza de los socios",
										"El dinero en efectivo"
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
import {useRef, useState} from "react";
import Banner from "../../../../../components/ui/Banner/Banner.jsx";
import Title from "../../../../../components/ui/Title/Title.jsx";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph.jsx";
import Image from "../../../../../components/ui/Image/Image.jsx";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz.jsx";
import Cursos from "../../../../../components/layout/Cursos/Cursos.jsx";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress.jsx";
import cursos from "../../../../../utils/cursos.js";
import {Video} from "../../../../../features/courses/components/Video/Video.jsx";

export default function Unidad1() {
	const [showModal, setShowModal] = useState(false);
	const scrollContainerRef = useRef(null);
	const curso = 1;
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
							img="/c2Banner1.jpg"
							title={cursos[curso].units[unidad - 1].unit}
						/>
						<div id="modulo1">
							<Title
								title={cursos[curso].units[unidad - 1].modules[0].modulo}
							/>
							<Paragraph p="En la era digital, la seguridad y la prevención del fraude se han vuelto más importantes que nunca. Los canales digitales, como la banca en línea, las aplicaciones de pago móvil y las plataformas de comercio electrónico, han revolucionado la forma en que interactuamos con el dinero, brindándonos comodidad y accesibilidad sin precedentes. Sin embargo, estas innovaciones también han creado nuevas oportunidades para que los ciberdelincuentes perpetren fraudes." />
							<Paragraph p="Este curso, 'Introducción a la seguridad y fraudes financieros', está diseñado para proporcionar una comprensión integral de los principales ataques de ciberdelincuentes y estafadores. Exploraremos los diferentes tipos de fraudes, desde el phishing y el malware hasta el robo de identidad y el fraude en el comercio electrónico. Además, aprenderemos métodos efectivos de prevención y estrategias para el manejo seguro de transacciones, con el fin de proteger nuestros activos financieros en el entorno digital. Este curso ofrecerá las herramientas necesarias para identificar señales de fraude y adoptar medidas de seguridad robustas." />
							<Paragraph p=" Al finalizar, estarás mejor preparado para enfrentar los desafíos de seguridad en los canales digitales financieros y contribuir a un entorno digital más seguro." />
							<Image
								img="/ff.jpeg"
								showModal={showModal}
								setShowModal={setShowModal}
							/>
							<Title title="Principales Tipos de Fraudes en Canales Digitales Financieros" />
						</div>
						<div id="modulo2">
							<Title
								title={cursos[curso].units[unidad - 1].modules[1].modulo}
							/>
							<Paragraph p="El phishing es una técnica utilizada por los ciberdelincuentes para engañar a los usuarios y robar información personal y financiera confidencial. Esto se hace mediante correos electrónicos, mensajes de texto, sitios web falsos o inclusive mensajes de whatsapp o llamadas telefónicas, haciendose pasar por entidades legítimas. Los usuarios pueden recibir un correo electrónico que parece provenir de su banco, solicitando que verifiquen su información de cuenta. Al hacer clic en el enlace y proporcionar la información solicitada, los datos son enviados directamente a los delincuentes." />
							<div className="flex justify-center">
								<Video
									src="/videos/curso2unidad1video.mp4"
									poster="/videos/curso2unidad1img.png"
									title="Que es Phishing?"
								/>
							</div>
						</div>

						<div id="modulo3">
							<Title
								title={cursos[curso].units[unidad - 1].modules[2].modulo}
							/>
							<Paragraph p="El malware se refiere a cualquier software diseñado para dañar, explotar o infiltrarse en dispositivos. Los tipos comunes de malware incluyen virus, troyanos, gusanos y ransomware. Una vez que el malware infecta un dispositivo, puede robar datos, interceptar transacciones o incluso tomar el control del dispositivo. Es crucial contar con software antivirus actualizado y estar alerta a las descargas sospechosas para evitar infecciones, es de suma importancia al descargar programas hacerlo de los sitios oficiales, y evitar a toda costa programas, juegos o cualquer otro tipo de software pirata o crackeado ya que esta es una de las principales vias de infección" />
							<div className="flex justify-center">
								<Video
									src="/videos/curso2unidad1video2.mp4"
									poster="/videos/curso2unidad1img2.png"
									title="Que es malware?"
								/>
							</div>
						</div>
						<div id="modulo4">
							<Title
								title={cursos[curso].units[unidad - 1].modules[3].modulo}
							/>
							<Paragraph p="El robo de identidad ocurre cuando los ciberdelincuentes usan ilegalmente la información personal de alguien para obtener acceso a cuentas financieras o solicitar servicios en su nombre. Esto puede incluir el uso de números de seguro social, cédula de identidad, números de tarjetas de crédito y otra información personal para realizar compras no autorizadas, abrir nuevas cuentas de crédito o cometer otros tipos de fraude financiero." />
							<div className="flex justify-center">
								<Video
									src="/videos/curso2unidad1video3.mp4"
									poster="/videos/curso2unidad1img3.png"
									title="Como evitar el Robo de tu Información?"
								/>
							</div>
						</div>
						<div id="modulo5">
							<Title
								title={cursos[curso].units[unidad - 1].modules[4].modulo}
							/>
							<Paragraph p="El fraude en el comercio electrónico puede tomar varias formas, incluyendo el uso de tarjetas de crédito robadas, la creación de cuentas falsas o la manipulación de reseñas de productos para engañar a los consumidores. Este tipo de fraude no solo afecta a los consumidores, sino también a los comerciantes, que pueden enfrentar pérdidas financieras significativas y daños a su reputación." />
							<Image
								img="/ff1.jpg"
								showModal={showModal}
								setShowModal={setShowModal}
							/>
						</div>
						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question: "¿Cuál es el principal objetivo del phishing?",
									options: [
										"Robar información personal y financiera",
										"Destruir datos en el dispositivo",
										"Crear cuentas falsas",
									],
									answer: 1,
								},
								{
									question:
										"¿Cual de estas opciones es también conocido como virus?",
									options: ["Phishing", "Robo de Identidad", "Malware"],
									answer: 3,
								},
								{
									question:
										"¿Cuál es una forma efectiva de prevenir el malware?",
									options: [
										"Usar software antivirus actualizado",
										"Ignorar las actualizaciones del sistema",
										"Descargar software de sitios no oficiales",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué información pueden usar los ciberdelincuentes para el robo de identidad?",
									options: [
										"Número de cédula",
										"Estadísticas de producción",
										"Información meteorológica",
									],
									answer: 1,
								},
								{
									question:
										"¿Cuál de las siguientes opciones NO es una forma de fraude en el comercio electrónico?",
									options: [
										"Uso de tarjetas de crédito robadas",
										"Manipulación de reseñas de productos",
										"Verificar transacciones bancarias",
									],
									answer: 3,
								},
								{
									question:
										"¿Qué medida ayuda a prevenir el fraude en el comercio electrónico?",
									options: [
										"Utilizar conexiones inseguras",
										"Revisar reseñas del vendedor e investigar",
										"Compartir información personal en sitios no seguros",
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

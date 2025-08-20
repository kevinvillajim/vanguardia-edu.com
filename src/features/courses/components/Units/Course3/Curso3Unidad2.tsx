import {useRef} from "react";
import Banner from "../../../../../components/ui/Banner/Banner";
import Title from "../../../../../components/ui/Title/Title";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph";
import Image from "../../../../../components/ui/Image/Image";
import List from "../../../../../components/ui/List/List";
import SubTitle from "../../../../../components/ui/SubTitle/SubTitle";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz";
import Cursos from "../../../../../components/layout/Cursos/Cursos";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress";
import {Video} from "../../../../../features/courses/components/Video/Video";
import cursos from "../../../../../utils/cursos.js";

export default function Unidad2() {
	const scrollContainerRef = useRef(null);
	const curso = 2;
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
							img="/c3Banner2.jpeg"
							title={cursos[curso].units[unidad - 1].unit}
						/>
						<div id="modulo1">
							<Title
								title={cursos[curso].units[unidad - 1].modules[0].modulo}
							/>
						</div>
						<SubTitle subtitle="Phishing - La amenaza más común" />
						<Paragraph p="El phishing es una técnica de ciberataque que utiliza correos electrónicos, mensajes de texto o sitios web fraudulentos para engañar a las víctimas y hacerles revelar información confidencial como contraseñas, números de cuenta o datos personales. Los atacantes se hacen pasar por entidades confiables como bancos, cooperativas o instituciones gubernamentales." />
						<Paragraph p="En el sector cooperativo, los ataques de phishing suelen dirigirse tanto a empleados como a socios. Los criminales pueden crear correos que parecen provenir de la cooperativa solicitando actualización de datos, verificación de cuentas o confirmación de transacciones. Es crucial que tanto el personal como los socios sepan identificar estas amenazas." />
						<Image img="/Phishing.png" />
						<List
							li={[
								"Correos electrónicos con logotipos falsificados de la cooperativa",
								"Enlaces sospechosos que redirigen a sitios web maliciosos",
								"Solicitudes urgentes de actualización de datos personales",
								"Mensajes que generan sensación de urgencia o miedo",
								"Errores ortográficos y gramaticales en comunicaciones oficiales"
							]}
						/>
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad2video1.mp4"
								poster="/videos/curso2unidad1img.png"
								title="Phishing - La amenaza más común"
							/>
                            
						</div>
						<SubTitle subtitle="Malware - Software malicioso" />
						<Paragraph p="El malware es cualquier software diseñado para dañar, explotar o infiltrarse en sistemas informáticos sin autorización. Incluye virus, gusanos, troyanos, spyware y adware. En las cooperativas, el malware puede comprometer sistemas de gestión financiera, bases de datos de socios y plataformas de banca electrónica." />
						
                        <div className="flex justify-center">
                            <Video
								src="/videos/curso3unidad2video2.mp4"
								poster="/videos/curso2unidad1img2.png"
								title="Malware - Software malicioso"
							/>
                        </div>

						<div id="modulo2">
							<Title
								title={cursos[curso].units[unidad - 1].modules[1].modulo}
							/>
						</div>
						<SubTitle subtitle="Ransomware - El secuestro digital" />
						<Paragraph p="El ransomware es un tipo de malware que cifra los archivos de una organización y exige el pago de un rescate para restaurar el acceso. Este tipo de ataque puede paralizar completamente las operaciones de una cooperativa, impidiendo el acceso a sistemas críticos, bases de datos de socios y plataformas de servicios financieros." />
						<Paragraph p="Los ataques de ransomware han aumentado exponentially en los últimos años. En 2023, se reportaron más de 4,000 ataques de ransomware diarios a nivel mundial. Las instituciones financieras, incluyendo cooperativas, son objetivos frecuentes debido a su capacidad de pago y la naturaleza crítica de sus servicios." />
						<List
							li={[
								"Cifrado de archivos críticos del sistema",
								"Bloqueo de acceso a bases de datos de socios",
								"Interrupción de servicios de banca electrónica y móvil",
								"Exigencia de pago en criptomonedas",
								"Amenazas de publicación de información confidencial",
								"Daño reputacional y pérdida de confianza de los socios"
							]}
						/>
                        <div className="flex justify-center">
							<Video
								src="/videos/curso3unidad2video3.mp4"
								poster="/videos/curso3unidad2img3.png"
								title="Ransomware - El secuestro digital"
							/>
						</div>

						<SubTitle subtitle="Ataques DDoS - Saturación de servicios" />
						<Paragraph p="Los ataques de Denegación de Servicio Distribuido (DDoS) buscan saturar los servidores de una organización con tráfico malicioso, haciendo que los servicios digitales sean inaccesibles para los usuarios legítimos. Para las cooperativas, esto significa que los socios no pueden acceder a la banca en línea, aplicaciones móviles o realizar transacciones digitales." />
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad2video4.mp4"
								poster="/videos/curso3unidad2img4.png"
								title="Ataque DDoS"
							/>
						</div>

						<div id="modulo3">
							<Title
								title={cursos[curso].units[unidad - 1].modules[2].modulo}
							/>
						</div>
						<SubTitle subtitle="Ingeniería Social - El factor humano" />
						<Paragraph p="La ingeniería social es la manipulación psicológica de las personas para que divulguen información confidencial o realicen acciones que comprometan la seguridad. Los atacantes explotan la confianza, el miedo, la curiosidad o la autoridad para engañar a sus víctimas. En las cooperativas, esto puede incluir llamadas telefónicas fraudulentas, correos electrónicos de phishing o visitas presenciales de personas que se hacen pasar por auditores o técnicos." />
						<List
							li={[
								"Llamadas telefónicas haciéndose pasar por soporte técnico",
								"Solicitudes de información por parte de falsos auditores",
								"Manipulación emocional para generar urgencia",
								"Explotación de la jerarquía organizacional",
								"Uso de información pública para ganar credibilidad",
								"Aprovechamiento de eventos actuales o crisis"
							]}
						/>
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad2video5.mp4"
								poster="/videos/curso3unidad2img5.png"
								title="Ingeniería Social - El factor humano"
							/>
						</div>

						<SubTitle subtitle="Fraude Financiero Digital" />
						<Paragraph p="El fraude financiero digital abarca diversas técnicas utilizadas para comprometer sistemas de pago, robar fondos o realizar transacciones no autorizadas. Esto incluye la suplantación de identidad, manipulación de sistemas de pago, creación de cuentas falsas y esquemas de lavado de dinero a través de plataformas digitales." />
						<Paragraph p="Las cooperativas deben implementar sistemas robustos de detección de fraude que incluyan monitoreo en tiempo real de transacciones, análisis de comportamiento de usuarios y validación de identidad multifactor. La detección temprana es crucial para minimizar las pérdidas y proteger a los socios." />
						<List
							li={[
								"Monitoreo de patrones de transacciones inusuales",
								"Implementación de límites de transacción",
								"Verificación de identidad en múltiples pasos",
								"Alertas automáticas para actividades sospechosas",
								"Capacitación continua del personal en detección de fraudes",
								"Colaboración con entidades regulatorias y de seguridad"
							]}
						/>

<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad2video6.mp4"
								poster="/videos/curso3unidad2img6.png"
								title="Fraudes Financieros Digitales"
							/>
						</div>

						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question: "¿Qué es el phishing?",
									options: [
										"Un sistema de respaldo",
										"Un ataque que busca engañar al usuario para obtener información",
										"Un tipo de firewall"
									],
									answer: 2,
								},
								{
									question: "¿Qué hace un ataque DDoS?",
									options: [
										"Roba contraseñas",
										"Cifra archivos",
										"Satura servidores para interrumpir servicios"
									],
									answer: 3,
								},
								{
									question: "¿Cuál es una característica del ransomware?",
									options: [
										"Mejora el rendimiento del sistema",
										"Cifra archivos y exige un pago para liberarlos",
										"Protege la red"
									],
									answer: 2,
								},
								{
									question: "¿Qué es la ingeniería social?",
									options: [
										"Uso de software para proteger redes",
										"Manipulación psicológica para obtener acceso o información",
										"Un tipo de cifrado"
									],
									answer: 2,
								},
								{
									question: "¿Aproximadamente cuántos ataques de ransomware se reportan diariamente a nivel mundial?",
									options: [
										"1,000",
										"2,500",
										"4,000"
									],
									answer: 3,
								},
							]}
						/>
					</div>
				}
			/>
		</>
	);
}
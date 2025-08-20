import {useRef} from "react";
import Banner from "../../../../../components/ui/Banner/Banner";
import Title from "../../../../../components/ui/Title/Title";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph";
import Image from "../../../../../components/ui/Image/Image";
import List from "../../../../../components/ui/List/List";
import SubTitle from "../../../../../components/ui/SubTitle/SubTitle";
import Tabs from "../../../../../components/ui/Tabs/Tabs";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz";
import Cursos from "../../../../../components/layout/Cursos/Cursos";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress";
import {Video} from "../../../../../features/courses/components/Video/Video";
import cursos from "../../../../../utils/cursos.js";

export default function Unidad3() {
	const scrollContainerRef = useRef(null);
	const curso = 2;
	const unidad = 3;
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
							img="/c3Banner3.jpg"
							title={cursos[curso].units[unidad - 1].unit}
						/>
						<div id="modulo1">
							<Title
								title={cursos[curso].units[unidad - 1].modules[0].modulo}
							/>
						</div>
						<SubTitle subtitle="Normativas Internacionales" />
						<Paragraph p="Las cooperativas deben cumplir con diversos estándares y regulaciones tanto a nivel nacional como internacional para garantizar la seguridad de la información y la protección de los datos de sus socios. Estos marcos normativos establecen los requisitos mínimos que deben implementar las instituciones financieras." />
						
						<Tabs
							tabs={[
								{
									id: "tab1",
									title: "ISO/IEC 27001",
									icon: "security",
									image: "/iso27001.png",
									content:
										"La norma ISO/IEC 27001 es el estándar internacional más reconocido para sistemas de gestión de seguridad de la información (SGSI). Establece los requisitos para establecer, implementar, mantener y mejorar continuamente un sistema de gestión de seguridad de la información. Las cooperativas que implementan esta norma demuestran su compromiso con la protección de la información y pueden obtener certificación.",
								},
								{
									id: "tab2",
									title: "PCI DSS",
									icon: "credit_card",
									image: "/pci-dss.png",
									content:
										"El Estándar de Seguridad de Datos de la Industria de Tarjetas de Pago (PCI DSS) es obligatorio para todas las organizaciones que almacenan, procesan o transmiten datos de tarjetas de crédito. Las cooperativas que ofrecen servicios de tarjetas de débito o crédito deben cumplir con estos requisitos para proteger la información de los tarjetahabientes.",
								},
								{
									id: "tab3",
									title: "GDPR",
									icon: "gavel",
									image: "/gdpr.png",
									content:
										"El Reglamento General de Protección de Datos (GDPR) de la Unión Europea aplica a cualquier organización que procese datos personales de ciudadanos europeos, independientemente de dónde esté ubicada la organización. Las cooperativas que tengan socios europeos deben cumplir con estas regulaciones estrictas de protección de datos.",
								},
							]}
						/>

						<SubTitle subtitle="Regulaciones Locales" />
						<Paragraph p="En Ecuador, las cooperativas están sujetas a regulaciones específicas establecidas por la Superintendencia de Economía Popular y Solidaria (SEPS) y otras entidades regulatorias. Estas normativas establecen requisitos específicos para la gestión de riesgos tecnológicos y ciberseguridad." />
						<Image img="/seps.jpg" />
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad3video1.mp4"
								poster="/videos/curso3unidad3img1.png"
								title="Seps"
							/>
						</div>

						<div id="modulo2">
							<Title
								title={cursos[curso].units[unidad - 1].modules[1].modulo}
							/>
						</div>
						<SubTitle subtitle="Controles de Seguridad para Banca Electrónica" />
						<Paragraph p="Las cooperativas que ofrecen servicios de banca electrónica deben implementar controles de seguridad específicos para proteger las transacciones y datos de sus socios. Estos controles incluyen autenticación fuerte, cifrado de datos, monitoreo continuo y gestión de sesiones seguras." />
						<List
							li={[
								"Autenticación de dos factores (2FA) o multifactor (MFA)",
								"Cifrado de extremo a extremo para todas las comunicaciones",
								"Timeouts de sesión automáticos para prevenir acceso no autorizado",
								"Monitoreo en tiempo real de transacciones sospechosas",
								"Logs detallados de todas las actividades del usuario",
								"Validación de IP y detección de comportamiento anómalo"
							]}
						/>
						<Image img="/2fa.jpg" />

						<SubTitle subtitle="Controles para Banca Móvil" />
						<Paragraph p="La banca móvil requiere controles de seguridad adicionales debido a las vulnerabilidades específicas de los dispositivos móviles. La SEPS recomienda implementar autenticación de dos pasos mediante códigos OTP (One-Time Password) y otras medidas de seguridad avanzadas." />
						<List
							li={[
								"Códigos OTP enviados por SMS o aplicación",
								"Biometría (huella dactilar, reconocimiento facial)",
								"Detección de dispositivos rooteados o con jailbreak",
								"Geolocalización para detectar accesos desde ubicaciones inusuales",
								"Cifrado de la aplicación móvil",
								"Actualizaciones automáticas de seguridad"
							]}
						/>
						<Image img="/movil.png" />
						
						<div id="modulo3">
							<Title
								title={cursos[curso].units[unidad - 1].modules[2].modulo}
							/>
						</div>
						<SubTitle subtitle="¿Qué es un Plan de Continuidad del Negocio?" />
						<Paragraph p="Un plan de continuidad del negocio es un conjunto de procedimientos y estrategias diseñados para mantener las operaciones esenciales de una cooperativa durante y después de un incidente de ciberseguridad o cualquier otra disrupción. Este plan es fundamental para minimizar el impacto en los socios y recuperar los servicios lo más rápidamente posible." />
						<Image img="/continuidad.webp" />

						<SubTitle subtitle="Componentes Clave del Plan" />
						<List
							li={[
								"Identificación de sistemas y procesos críticos",
								"Procedimientos de respuesta a incidentes",
								"Estrategias de comunicación con socios y stakeholders",
								"Planes de respaldo y recuperación de datos",
								"Protocolos de escalamiento y notificación",
								"Pruebas regulares y actualizaciones del plan"
							]}
						/>

						<SubTitle subtitle="Gestión de Crisis y Comunicación" />
						<Paragraph p="Durante un incidente de ciberseguridad, la comunicación efectiva es crucial para mantener la confianza de los socios y cumplir con los requisitos regulatorios. Las cooperativas deben tener protocolos claros para comunicar incidentes tanto internamente como a las autoridades correspondientes y a los socios afectados." />
						<div className="flex justify-center">
							<Video
								src="/videos/curso3unidad3video2.mp4"
								poster="/videos/curso3unidad3img2.png"
								title="Seps"
							/>
						</div>

						<SubTitle subtitle="Recuperación y Lecciones Aprendidas" />
						<Paragraph p="Después de cualquier incidente de ciberseguridad, es fundamental realizar una evaluación completa para identificar qué funcionó bien, qué necesita mejorar y cómo prevenir incidentes similares en el futuro. Esta evaluación debe resultar en actualizaciones del plan de continuidad y mejoras en los controles de seguridad." />

						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question: "¿Qué medida de seguridad es recomendada por la SEPS para banca móvil?",
									options: [
										"Contraseñas simples",
										"Autenticación de dos pasos (OTP)",
										"Compartir enlaces de acceso"
									],
									answer: 2,
								},
								{
									question: "¿Qué norma internacional establece requisitos para un Sistema de Gestión de Seguridad de la Información?",
									options: [
										"ISO 9001",
										"ISO/IEC 27001",
										"PCI DSS"
									],
									answer: 2,
								},
								{
									question: "¿Qué tipo de control se recomienda para banca electrónica?",
									options: [
										"Registro de IPs y comportamiento inusual",
										"Acceso libre",
										"Contraseñas compartidas"
									],
									answer: 1,
								},
								{
									question: "¿Qué es un plan de continuidad del negocio?",
									options: [
										"Un plan de marketing",
										"Un plan para mantener operaciones ante incidentes",
										"Un plan de vacaciones"
									],
									answer: 2,
								},
								{
									question: "¿Cuál es el propósito principal del estándar PCI DSS?",
									options: [
										"Proteger datos de tarjetas de pago",
										"Mejorar la velocidad de internet",
										"Reducir costos operativos"
									],
									answer: 1,
								},
							]}
						/>
					</div>
				}
			/>
		</>
	);
}
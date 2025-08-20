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

export default function Unidad3() {
	const scrollContainerRef = useRef(null);
	const curso = 0;
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
							img="/c1Banner3.jpg"
							title="Unidad 3: Derechos del interesado"
						/>
						<div id="modulo1">
							<Title title="3.1 Derechos" />
						</div>
						<Paragraph p="Los datos personales y el control sobre ellos le pertenecen a cada Interesado. Por lo cual el interesado, podrá ejercer los derechos, que se indican a continuación:" />
						<List
							li={[
								"El Interesado puede conocer qué datos personales son tratados por NUESTRA ORGANIZACIÓN.",
								" El Interesado puede actualizar sus datos personales en caso de alguna modificación o actualización.",
								"El Interesado puede solicitar la eliminación de sus datos personales cuando no sea necesario con la finalidad con la que se recolectó inicialmente, o a su vez si el Interesado no tiene ningún producto, servicio activo u obligaciones con NUESTRA ORGANIZACIÓN.",
								"El Interesado puede oponerse al uso de sus datos personales para finalidades distintas a las que se recabó, si no son necesarias para mantener la relación contractual.",
							]}
						/>
						<Paragraph p="El Interesado puede solicitar el cese temporal del tratamiento de sus datos cuando:" />
						<List
							li={[
								"Impugna la exactitud de sus datos personales",
								"Si NUESTRA ORGANIZACIÓN no requiere tratar sus datos personales pero el Interesado los llega a necesitar para la formulación, el ejercicio o la defensa de reclamaciones.",
								"Si se opone al tratamiento de sus datos para el cumplimiento de una misión en interés público o para la satisfacción de un interés legítimo, mientras NUESTRA ORGANIZACIÓN corrobora si los motivos legítimos para el tratamiento prevalecen sobre los del Interesado.",
								"El Interesado puede solicitar a NUESTRA ORGANIZACIÓN la entrega de sus datos personales en un formato digital.",
								"El Interesado puede solicitar que un operador de NUESTRA ORGANIZACIÓN intervenga para explicarle al Interesado la decisión del tratamiento automatizado, recoger sus comentarios sobre ello impugnar la decisión de NUESTRA ORGANIZACIÓN en caso de requerirlo.",
							]}
						/>
						<Paragraph p="NUESTRA ORGANIZACIÓN en función de su interés legítimo analiza las preferencias de los Interesados para ofrecer productos y servicios que se consideran de su interés. Adicionalmente, el Interesado podría autorizar a NUESTRA ORGANIZACIÓN a:" />
						<List
							li={[
								"Consultar y tratar los datos personales y preferencias de forma detallada para que NUESTRA ORGANIZACIÓN ofrezca las soluciones productos y/o servicios.",
								"Contactar con el Interesado para ofrecer propuestas de valor de productos y servicios.",
								"El Interesado al declarar que conoce estos puntos, autoriza a NUESTRA ORGANIZACIÓN de manera expresa a tratar sus datos personales. Dicho consentimiento será recabado al aceptar la declaración de privacidad mediante los canales digitales, de manera verbal u otros medios utilizados por NUESTRA ORGANIZACIÓN",
							]}
						/>
						<Image img="/lopdp.jpg" />
						<div id="modulo2">
							<Title title="3.2 Amenazas Actuales" />
						</div>
						<SubTitle subtitle="Ahora, aprendamos a proteger nuestros datos identificando amenazas actuales." />
						<Image img="/advertencia.webp" />
						<SubTitle subtitle="ALERTA!" />
						<Paragraph p="Basta con que tú seas víctima de engaño por parte de cibercriminales y puedes perjudicar a toda tu organización, todos los equipos e inclusive tus datos personales y de todos tus compañeros" />
						<Tabs
							tabs={[
								{
									id: "tab1",
									title: "Ingeniería Social",
									icon: "group",
									image: "/ingsocial.webp",
									content:
										"Es una técnica de manipulación psicológica utilizada para engañar a individuos y hacer que divulguen información confidencial o realicen acciones que comprometan la seguridad. Es mas facil vulnerar a personas que a la tecnología",
								},
								{
									id: "tab2",
									title: "Malware",
									icon: "coronavirus",
									image: "/malware.jpg",
									content:
										"Software malicioso diseñado para dañar, explotar, o comprometer sistemas informáticos sin el conocimiento o consentimiento del usuario.\n Los Backdoors uno de los mas peligrosos malewares deja un acceso abierto por donde ciberdelincuentes pueden aparte de robar toda tu información, manejan tu máquina remótamente.",
								},
								{
									id: "tab3",
									title: "Ransomware",
									icon: "lock",
									image: "/ransomware.png",
									content:
										"Tipo de malware que cifra los datos de un sistema y exige un rescate económico a la víctima para restaurar el acceso a la información secuestrada. \n Ha generado perdidas de: $8MIL Millones de Dólares en 2023 y se estima $9.5MIL MILLONES de Dólares en 2024",
								},
							]}
						/>
						<div id="modulo3">
							<Title title="3.3 ¿Que hacer para no ser víctimas?" />
						</div>
						<List
							li={[
								"NO LO REENVIES, SALVO QUE TE PIDA EL ÁREA DE SEGURIDAD INFORMÁTICA.",
								"NO DES CLIC EN LOS ENLACES DEL CORREO SOSPECHOSO, INGRESA A UN SITIO WEB DIRECTAMENTE DESDE EL NAVEGADOR Y FIJATE EL NOMBRE DE LA PAGINA WEB, GENERALMENTE LOS CIBER CRIMINALES COMPRAN DOMINIOS PARECIDOS CON EL FIN DE CONFUNDIRTE POR EJEMPLO: https://www.cooprogreso1.fin.ec/ o https://www.coooprogreso.fin.ec/",
								"NO CONTESTES CORREOS SOSPECHOSO SI DUDAS NO TE ARRIEZGUES",
								"APRENDE SOBRE SEGURIDAD DE LA INFORMACIÓN",
							]}
						/>
						<Tabs
							tabs={[
								{
									id: "tab1",
									title: "Ingeniería Social",
									icon: "group",
									image: "/ingsocial2.webp",
									content:
										"1) No te dejes engañar de los ciberdelincuentes, revisa remitentes y dominios.\n 2) Revisa las veces que sea necesaria una información nueva o urgente.\n 3) Cuestiónate a tí mismo sobre ese mensaje antes de actuar por impulso.\n 4)Si es un mensaje sospechoso, no ejecutes lo que te piden y valida los puntos antes indicados.\n 5)Reporta.",
								},
								{
									id: "tab2",
									title: "Malware",
									icon: "coronavirus",
									image: "/malware2.jpg",
									content:
										"1) Instala las actualizaciones de software y parches de seguridad para el sistema operativo, aplicaciones y navegadores. Estas actualizaciones corrigen vulnerabilidades que pueden ser explotadas por el malware.\n 2) Manten atualizado siempre tu antivirus, realiza escaneos regulares y activa la protección en tiempo real\n 3) Descarga software solo de fuentes confiables y sitios oficiales",
								},
								{
									id: "tab3",
									title: "Ransomware",
									icon: "lock",
									image: "/ransomware2.jpg",
									content:
										"1) En tu organización se hace un esfuerzo muy grande para que los sistemas estén actualizados, Debes ayudar a que esosprocesos se completen, uno de ellos es el reinicio de los equipos.\n 2) Al igual que los otros, nunca instales software sospechoso ni ingrerses a links directamente desde el correo.",
								},
							]}
						/>
						<Image img="/teamwork.jpg" />
						<Title title="Contamos con tu apoyo!" />
						<SubTitle subtitle="Estamos fortaleciendo la seguridad de la información en nuestra organización y lo más importante para lograrlo, ¡eres tú!" />
						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question: "¿Qué es la ingeniería social?",
									options: [
										"Una técnica de manipulación psicológica utilizada para engañar a individuos y hacer que divulguen información confidencial.",
										"Un tipo de software malicioso diseñado para dañar sistemas informáticos.",
										"Una técnica de cifrado de datos utilizada por empresas para proteger información.",
									],
									answer: 1,
								},
								{
									question:
										"¿Cuál es la mejor práctica para evitar el malware?",
									options: [
										"Mantener el software y antivirus siempre actualizados.",
										"Abrir correos de remitentes desconocidos.",
										"Compartir contraseñas con colegas.",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué acción se recomienda en caso de recibir un correo sospechoso?",
									options: [
										"Reenviarlo a todos los contactos.",
										"No hacer clic en los enlaces y reportarlo al área de seguridad informática.",
										"Responder inmediatamente al remitente.",
									],
									answer: 2,
								},
								{
									question: "¿Qué es el ransomware?",
									options: [
										"Un tipo de malware que cifra los datos y exige un rescate económico.",
										"Un software de protección de datos personales.",
										"Un método de autenticación de dos factores.",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué debe hacer un interesado si quiere actualizar sus datos personales?",
									options: [
										"Solicitar la actualización a NUESTRA ORGANIZACIÓN.",
										"Eliminar sus datos personales.",
										"Enviar sus datos a través de un correo electrónico.",
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

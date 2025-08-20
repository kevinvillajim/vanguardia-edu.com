import {useRef} from "react";
import Banner from "../../../../../components/ui/Banner/Banner";
import Title from "../../../../../components/ui/Title/Title";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph";
import Image from "../../../../../components/ui/Image/Image";
import SubTitle from "../../../../../components/ui/SubTitle/SubTitle";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz";
import Cursos from "../../../../../components/layout/Cursos/Cursos";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress";
import cursos from "../../../../../utils/cursos.js";
import PasswordStrengthChecker from "../../../../../components/ui/PasswordStrengthChecker/PasswordStrengthChecker";

export default function Unidad3() {
	const scrollContainerRef = useRef(null);
	const curso = 1;
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
							img="/c2Banner3.jpg"
							title={cursos[curso].units[unidad - 1].unit}
						/>
						<div id="modulo1">
							<Title
								title={cursos[curso].units[unidad - 1].modules[0].modulo}
							/>
							<div className="pl-[1rem]">
								<Title title="3.1.1 Contraseñas Fuertes" />
							</div>
							<Paragraph p="Utiliza contraseñas únicas y complejas para cada una de tus cuentas, combinando letras mayúsculas y minúsculas, números y símbolos. Las contraseñas deben ser difíciles de adivinar y no deben reutilizarse en múltiples sitios." />
							<Image img="/pass.webp" />
							<div className="p-[2rem] rounded-md shadow-lg bg-gray-700">
								<SubTitle subtitle="Revisa si tu contraseña es segura" />
								<div className="flex justify-center">
									<div className="w-[50%]">
										<PasswordStrengthChecker />
									</div>
								</div>
							</div>
						</div>
						<div className="pl-[1rem]">
							<Title title="3.1.2 Autenticación de Dos Factores (2FA)" />
						</div>
						<Paragraph p="Activa la autenticación de dos factores (2FA) para tus cuentas importantes. Este método requiere un segundo paso de verificación, como un código enviado a tu teléfono o un escaneo de huellas dactilares, proporcionando una capa adicional de seguridad." />
						<Image img="/a2p.jpg" />
						<div className="pl-[1rem]">
							<Title title="3.1.3 Software Antivirus" />
						</div>
						<Paragraph p="Instala y mantiene actualizado un software antivirus confiable para proteger tu dispositivo de malware y otros tipos de amenazas cibernéticas. El software antivirus puede detectar y eliminar amenazas antes de que puedan causar daño." />
						<Image img="/antivirus.png" />
						<div className="pl-[1rem]">
							<Title title="3.1.4 Evitar Redes Wi-Fi Públicas" />
						</div>
						<Paragraph p="Evita conectarte a redes Wi-Fi públicas sin contraseña, especialmente cuando realices transacciones financieras o accedas a información sensible. Las redes Wi-Fi públicas son vulnerables a los ataques de intermediarios, que pueden interceptar los datos transmitidos." />
						<Image img="/wifi.png" />

						<div id="modulo2">
							<Title
								title={cursos[curso].units[unidad - 1].modules[1].modulo}
							/>
						</div>
						<SubTitle subtitle="Ahora, aprendamos a proteger nuestros datos manejando pagos y transacciones en línea." />
						<Image img="/pSeguro.png" />
						<SubTitle subtitle="ALERTA!" />
						<Paragraph p="Si quieres cuidar tus datos y evitar robos y estafas, sigue los siguientes lineamientos citados a continuación, y recuerda: Simpre desconfía, mas vale prevenir que lamentar!" />
						<div className="pl-[1rem]">
							<Title title="3.2.1 Utilizar conexiones seguras" />
						</div>
						<Paragraph p="Para garantizar la seguridad de tus transacciones en línea, es fundamental utilizar conexiones seguras. Las conexiones seguras se indican mediante 'https' al inicio de la URL en el navegador. El 'https' (Hypertext Transfer Protocol Secure) asegura que los datos transferidos entre tu navegador y el sitio web están cifrados y protegidos contra interceptaciones. Además, verifica que aparezca un ícono de candado en la barra de direcciones, lo que indica que el sitio web tiene un certificado de seguridad válido. Evita ingresar información personal o financiera en sitios web que no muestren estas señales de seguridad." />
						<Image img="/https.png" />
						<div className="pl-[1rem]">
							<Title title="3.2.2 Evitar redes Wi-Fi públicas" />
						</div>
						<Paragraph p="Las redes Wi-Fi públicas, como las que se encuentran en cafeterías, aeropuertos y hoteles, son especialmente vulnerables a los ataques cibernéticos. Los ciberdelincuentes pueden interceptar los datos transmitidos a través de estas redes, incluyendo información personal y financiera. Para proteger tus datos, evita realizar transacciones bancarias, compras en línea o ingresar información sensible mientras estés conectado a una red Wi-Fi pública. Si es necesario usar una red pública, considera utilizar una red privada virtual (VPN), que encripta tu conexión y protege tus datos contra accesos no autorizados." />
						<Image img="/vpn.jpg" />
						<div className="pl-[1rem]">
							<Title title="3.2.3 Proteger la información de pago" />
						</div>
						<Paragraph p="Protege tu información de pago limitando su divulgación solo a sitios web de confianza. Antes de ingresar los detalles de tu tarjeta de crédito o cuenta bancaria, verifica que el sitio web sea legítimo y esté bien protegido. Desconfía de los sitios web que solicitan información excesiva o que ofrecen ofertas demasiado buenas para ser verdad. Además, habilita las alertas de transacciones en tu banco para recibir notificaciones inmediatas de cualquier movimiento en tu cuenta, lo que te permitirá detectar y responder rápidamente a cualquier actividad sospechosa." />
						<Image img="/pagoEnLinea.jpg" />
						<div className="pl-[1rem]">
							<Title title="3.2.4 Monitorear las transacciones" />
						</div>
						<Paragraph p="La monitorización regular de tus extractos bancarios y estados de cuenta es crucial para detectar cualquier actividad no autorizada en tus cuentas. Revisa todas las transacciones, incluso las de pequeños montos, ya que los ciberdelincuentes a menudo prueban con cargos pequeños antes de realizar transacciones mayores. Si notas alguna transacción sospechosa o desconocida, comunícate de inmediato con tu banco o proveedor de servicios financieros para reportarla y tomar medidas correctivas. Además, considera el uso de aplicaciones de banca móvil que te permiten supervisar tus cuentas en tiempo real, facilitando la detección temprana de cualquier irregularidad." />
						<Image img="/bancaMovil.jpg" />
						<SubTitle subtitle="Estamos fortaleciendo la seguridad de la información en nuestra organización y lo más importante para lograrlo, ¡eres tú!" />
						<Quiz
							unit={unidad}
							course={curso}
							questions={[
								{
									question:
										"¿Cuál de las siguientes opciones representa una contraseña fuerte?",
									options: ["123456", "MiPerro123", "C0@ñ3@2a24"],
									answer: 3,
								},
								{
									question: "¿Qué es la autenticación de dos factores (2FA)?",
									options: [
										"Un método de verificación adicional usando un segundo factor, como un código enviado a tu teléfono.",
										"Un software antivirus para proteger tu dispositivo.",
										"Una red Wi-Fi pública segura.",
									],
									answer: 1,
								},
								{
									question:
										"¿Cuál es una medida de seguridad al utilizar redes Wi-Fi públicas?",
									options: [
										"Conectarse a cualquier red sin preocuparse.",
										"Realizar transacciones financieras por http",
										"Utilizar una red privada virtual (VPN) para cifrar la conexión.",
									],
									answer: 3,
								},
								{
									question:
										"¿Cómo se indica una conexión segura en el navegador?",
									options: [
										"Por la presencia de 'https' en la URL y un ícono de candado.",
										"Por un ícono de una flecha en la barra de direcciones.",
										"Por que en la pagina web dice: Pago seguro.",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué se debe hacer antes de ingresar información de pago en un sitio web?",
									options: [
										"Verificar que el sitio web sea legítimo y tenga un certificado de seguridad válido.",
										"Ingresar la información rápidamente sin revisar.",
										"Resvisar las reseñas de el producto.",
									],
									answer: 1,
								},
								{
									question:
										"¿Qué es lo primero que debe hacer si nota una transacción sospechosa en su cuenta?",
									options: [
										"Ignorarla y esperar a ver si sucede de nuevo.",
										"Comunicarte de inmediato con tu banco o proveedor de servicios financieros para reportarla.",
										"Compartir la información con amigos para obtener su opinión.",
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

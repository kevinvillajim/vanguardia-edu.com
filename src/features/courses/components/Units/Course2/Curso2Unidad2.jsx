import { useRef } from "react";
import Banner from "../../../../../components/ui/Banner/Banner.jsx";
import Title from "../../../../../components/ui/Title/Title.jsx";
import Paragraph from "../../../../../components/ui/Paragraph/Paragraph.jsx";
import Image from "../../../../../components/ui/Image/Image.jsx";
import Quiz from "../../../../../features/courses/components/Quiz/Quiz.jsx";
import Cursos from "../../../../../components/layout/Cursos/Cursos.jsx";
import ScrollProgress from "../../../../../features/courses/components/ScrollProgress/ScrollProgress.jsx";
import cursos from "../../../../../utils/cursos.js";


export default function Unidad2() {
  const scrollContainerRef = useRef(null);
  const curso = 1;
  const unidad = 2;
  return (
    <>
      <Cursos
        curso={curso}
        contenido={
          <div
            ref={scrollContainerRef}
            className="h-[38rem] overflow-auto"
          >
            <ScrollProgress
              scrollContainerRef={scrollContainerRef}
              unit={unidad}
              course={curso}
            />
            <Banner
              img="/c2Banner2.jpg"
              title={cursos[curso].units[unidad - 1].unit}
            />
            <div id="modulo1">
              <Title
                title={cursos[curso].units[unidad - 1].modules[0].modulo}
              />
              <Paragraph p="Hay ciertos indicios que un atacante suele dejar al realizar un ataque, es indispensable ser obsrvador y cauteloso, la mejor forma de evitar un ataque es la prevención. En este módulo aprenderas a identificar las señales de peligro." />
              <div className="pl-[1rem]">
                <Title title="2.1.1 Solicitudes Sospechosas" />
              </div>
              <Paragraph p="Llamadas telefónicas o correos electrónicos que solicitan información personal o financiera sensible son señales de alerta, especialmente si no has iniciado la comunicación. Es importante verificar la autenticidad de estas solicitudes antes de proporcionar cualquier información. y si tienes dudas desconfía" />
              <Image img="/sf.jpg" />
              <div className="pl-[1rem]">
                <Title title="2.1.2 Envíos Inesperados" />
              </div>
              <Paragraph p="Recibir paquetes o productos que no has pedido, o mensajes que te indican que has ganado un premio o un sorteo en el que no recuerdas haber participado, puede ser una señal de fraude. Estos pueden ser intentos de obtener tu información personal o financiera a través de tácticas de ingeniería social." />
              <Image img="/sf2.webp" />
              <div className="pl-[1rem]">
                <Title title="2.1.3 Actividad Inusual en la Cuenta" />
              </div>
              <Paragraph p="Transacciones desconocidas en tu cuenta bancaria, cambios en las contraseñas o la información de contacto sin tu autorización, o intentos de acceso a tu cuenta desde ubicaciones desconocidas son indicativos de actividad fraudulenta. Es esencial monitorear regularmente tus cuentas para detectar estas señales a tiempo." />
              <Image img="/sf3.jpg" />
            </div>

            <div id="modulo2">
              <Title
                title={cursos[curso].units[unidad - 1].modules[1].modulo}
              />
              <div className="pl-[1rem]">
                <Paragraph p="Como puedo reconocer que quieren robar mis datos personales o que estoy siendo objetivo de ataques de cibercriminales?" />

                <Title title="2.2.1 Comprobar Remitentes" />
              </div>
              <Paragraph p="Verifica la dirección de correo electrónico y/o el dominio de la cuenta o el número de teléfono del remitente para asegurarte de que sea legítimo. Los ciberdelincuentes a menudo utilizan direcciones similares a las legítimas para engañar a los usuarios." />
              <Image img="/phishingCooprogreso.png" />
              <div className="pl-[1rem]">
                <Title title="2.2.2 Buscar Errores Gramaticales y Ortográficos" />
              </div>
              <Paragraph p="Los mensajes de phishing a menudo contienen errores gramaticales y ortográficos, lo que puede ser una señal de alerta. Las empresas legítimas generalmente envían comunicaciones bien escritas y revisadas." />
              <Image img="/emailCooprogreso.png" />
              <div className="pl-[1rem]">
                <Title title="2.2.3 Evitar Enlaces Sospechosos" />
              </div>
              <Paragraph p="No hagas clic en enlaces sospechosos en correos electrónicos o mensajes de texto, especialmente si no estás seguro del remitente o si el mensaje parece demasiado bueno para ser verdad. Los enlaces pueden dirigir a sitios web falsos diseñados para robar tu información." />
              <Image img="/phishingPaquete.webp" />
              <div className="pl-[1rem]">
                <Title title="2.2.4 Revisar el Contexto del Correo" />
              </div>
              <Paragraph p="Tiene sentido la información que recibiste en el correo? Si tienes dudas, comunícate directamente con la empresa o entidad que supuestamente envió el mensaje." />
              <Image img="/iphone.png" />
              <div className="pl-[1rem]">
                <Title title="2.2.5 Evitar Descargar Archivos Adjuntos" />
              </div>
              <Paragraph p="No descargues archivos adjuntos de correos o mensajes sospechosos, ya que pueden contener programas maliciosos que se descarguen en tu equipo." />
              <Image img="/adjunto.png" />
            </div>
            <Quiz
              unit={unidad}
              course={curso}
              questions={[
                {
                  question:
                    "¿Cuál de los siguientes dominios es el dominio correcto de la cooperativa?",
                  options: [
                    "cooprogres0.fin.ec",
                    "coopogreso.fin.ec",
                    "cooprogreso.fin-ec",
                    "cooprogreso.fin.ec",
                  ],
                  answer: 4,
                },
                {
                  question:
                    "¿Qué debes hacer si recibes un correo electrónico solicitando información personal de una fuente aparentemente conocida?",
                  options: [
                    "Proporcionar la información solicitada de inmediato",
                    "Verificar la autenticidad del remitente antes de responder",
                    "Ignorar el correo y eliminarlo",
                  ],
                  answer: 2,
                },
                {
                  question:
                    "¿Cuál de las siguientes NO es una señal de actividad fraudulenta en una cuenta?",
                  options: [
                    "Cambios en las contraseñas sin tu autorización",
                    "Transacciones desconocidas",
                    "Consultas frecuentes de saldo",
                  ],
                  answer: 3,
                },
                {
                  question:
                    "¿Qué deberías hacer si recibes un paquete inesperado notificandote por SMS de servientrega?",
                  options: [
                    "Abrir el link y aceptar el paquete sin verificar",
                    "Contactar a la empresa para verificar su autenticidad",
                    "Ignorar",
                  ],
                  answer: 2,
                },
                {
                  question:
                    "¿Por qué es importante buscar errores gramaticales y ortográficos en correos electrónicos?",
                  options: [
                    "Para asegurarse de que el correo es escrito por profesionales",
                    "Porque los correos legítimos siempre tienen errores",
                    "Porque los ciberdelincuentes a menudo cometen estos errores",
                  ],
                  answer: 3,
                },
                {
                  question:
                    "¿Qué medida de seguridad se debe tomar con enlaces sospechosos en correos electrónicos?",
                  options: [
                    "Hacer clic para verificar la información",
                    "Eliminar el correo sin hacer clic en los enlaces",
                    "Compartir el enlace con amigos para verificar",
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

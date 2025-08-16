// src/pages/public/Contact/Contact.jsx
import {useState} from "react";
import {motion} from "motion/react";
import {Card, Button} from "../../../components/ui";
import PublicHeader from "../../../components/layout/Header/PublicHeader";

const ContactPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		department: "",
		subject: "",
		message: "",
		priority: "media"
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);

	const departments = [
		{id: "capacitacion", name: "Área de Capacitación"},
		{id: "rrhh", name: "Recursos Humanos"},
		{id: "ti", name: "Tecnología"},
		{id: "cumplimiento", name: "Cumplimiento"},
		{id: "general", name: "Consulta General"}
	];

	const contactMethods = [
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
				</svg>
			),
			title: "Email",
			description: "Escríbenos directamente",
			contact: "capacitacion@cooprogreso.fin.ec",
			action: "mailto:capacitacion@cooprogreso.fin.ec"
		},
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
				</svg>
			),
			title: "Teléfono",
			description: "Llámanos en horario laboral",
			contact: "+593 2 398 8100",
			action: "tel:+59323988100"
		},
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			),
			title: "Ubicación",
			description: "Visítanos en nuestras oficinas",
			contact: "Av. Amazonas y República, Quito",
			action: "#"
		},
		{
			icon: (
				<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			title: "Horario de Atención",
			description: "Estamos disponibles",
			contact: "Lunes a Viernes: 8:00 - 17:00",
			action: "#"
		}
	];

	const faqItems = [
		{
			question: "¿Cómo accedo a mis cursos asignados?",
			answer: "Puedes acceder a tus cursos a través del portal interno usando tus credenciales corporativas. Si tienes problemas, contacta al área de TI."
		},
		{
			question: "¿Puedo solicitar capacitación personalizada?",
			answer: "Sí, ofrecemos programas de capacitación personalizados según las necesidades específicas de cada área. Contacta al equipo de capacitación para más información."
		},
		{
			question: "¿Los certificados tienen validez oficial?",
			answer: "Todos nuestros certificados son válidos para el desarrollo profesional interno y algunos cuentan con acreditación externa reconocida."
		},
		{
			question: "¿Qué hago si tengo problemas técnicos?",
			answer: "Para problemas técnicos con la plataforma, puedes contactar directamente al área de TI o usar el formulario de contacto especificando el problema."
		}
	];

	const handleInputChange = (e) => {
		const {name, value} = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		
		// Simular envío
		setTimeout(() => {
			setIsSubmitting(false);
			setSubmitted(true);
			setFormData({
				name: "",
				email: "",
				department: "",
				subject: "",
				message: "",
				priority: "media"
			});
		}, 2000);
	};

	if (submitted) {
		return (
			<div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
				<motion.div
					initial={{opacity: 0, scale: 0.9}}
					animate={{opacity: 1, scale: 1}}
					transition={{duration: 0.5}}
					className="max-w-md mx-auto text-center px-4"
				>
					<Card padding="xl">
						<div className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							¡Mensaje Enviado!
						</h3>
						<p className="text-gray-600 dark:text-gray-400 mb-6">
							Hemos recibido tu mensaje. Nuestro equipo te contactará pronto.
						</p>
						<Button variant="primary" onClick={() => setSubmitted(false)}>
							Enviar Otro Mensaje
						</Button>
					</Card>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<PublicHeader />
			{/* Hero Section */}
			<section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-900 overflow-hidden">
				{/* Background Elements */}
				<div className="absolute inset-0">
					<motion.div
						animate={{scale: [1, 1.2, 1], rotate: [0, 180, 360]}}
						transition={{duration: 20, repeat: Infinity, ease: "linear"}}
						className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
					/>
					<motion.div
						animate={{scale: [1.2, 1, 1.2], rotate: [360, 180, 0]}}
						transition={{duration: 15, repeat: Infinity, ease: "linear"}}
						className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-acent-500/20 rounded-full blur-3xl"
					/>
				</div>

				<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.h1
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8}}
						className="text-4xl md:text-6xl font-bold text-white mb-6"
					>
						Estamos aquí para{" "}
						<span className="text-acent-500">ayudarte</span>
					</motion.h1>
					
					<motion.p
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8, delay: 0.2}}
						className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
					>
						¿Tienes dudas sobre nuestros cursos? ¿Necesitas asistencia técnica? Nuestro equipo está listo para apoyarte en tu proceso de capacitación
					</motion.p>
				</div>
			</section>

			{/* Contact Methods */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8}}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							Múltiples formas de contactarnos
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
							Elige el método que más te convenga para resolver tus dudas
						</p>
					</motion.div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
						{contactMethods.map((method, index) => (
							<motion.div
								key={index}
								initial={{opacity: 0, y: 30}}
								animate={{opacity: 1, y: 0}}
								transition={{duration: 0.5, delay: index * 0.1}}
								whileHover={{y: -5}}
								className="group"
							>
								<Card padding="lg" hover className="h-full text-center">
									<div className="inline-flex p-4 rounded-2xl bg-gradient-to-bl from-primary-500 to-secondary-600
									text-white mb-6 group-hover:scale-110 transition-transform duration-300">
										{method.icon}
									</div>
									<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
										{method.title}
									</h3>
									<p className="text-gray-600 dark:text-gray-400 mb-4">
										{method.description}
									</p>
									<a
										href={method.action}
										className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
									>
										{method.contact}
									</a>
								</Card>
							</motion.div>
						))}
					</div>

					{/* Contact Form */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Form */}
						<motion.div
							initial={{opacity: 0, x: -50}}
							animate={{opacity: 1, x: 0}}
							transition={{duration: 0.8}}
						>
							<Card padding="lg">
								<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
									Envíanos un mensaje
								</h3>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Nombre completo *
											</label>
											<input
												type="text"
												name="name"
												value={formData.name}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Email corporativo *
											</label>
											<input
												type="email"
												name="email"
												value={formData.email}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Departamento *
											</label>
											<select
												name="department"
												value={formData.department}
												onChange={handleInputChange}
												required
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
											>
												<option value="">Seleccionar...</option>
												{departments.map(dept => (
													<option key={dept.id} value={dept.id}>
														{dept.name}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
												Prioridad
											</label>
											<select
												name="priority"
												value={formData.priority}
												onChange={handleInputChange}
												className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
											>
												<option value="baja">Baja</option>
												<option value="media">Media</option>
												<option value="alta">Alta</option>
												<option value="urgente">Urgente</option>
											</select>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Asunto *
										</label>
										<input
											type="text"
											name="subject"
											value={formData.subject}
											onChange={handleInputChange}
											required
											className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Mensaje *
										</label>
										<textarea
											name="message"
											value={formData.message}
											onChange={handleInputChange}
											required
											rows={5}
											className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
											placeholder="Describe tu consulta o problema en detalle..."
										/>
									</div>

									<Button
										type="submit"
										variant="acent"
										size="lg"
										disabled={isSubmitting}
										loading={isSubmitting}
										fullWidth
									>
										{isSubmitting ? "Enviando..." : "Enviar Mensaje"}
									</Button>
								</form>
							</Card>
						</motion.div>

						{/* FAQ */}
						<motion.div
							initial={{opacity: 0, x: 50}}
							animate={{opacity: 1, x: 0}}
							transition={{duration: 0.8, delay: 0.2}}
						>
							<h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
								Preguntas Frecuentes
							</h3>
							<div className="space-y-4">
								{faqItems.map((item, index) => (
									<Card key={index} padding="md">
										<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
											{item.question}
										</h4>
										<p className="text-gray-600 dark:text-gray-400 leading-relaxed">
											{item.answer}
										</p>
									</Card>
								))}
							</div>

							<Card variant="acent" padding="lg" className="mt-8">
								<h4 className="font-bold text-acent-900 dark:text-acent-100 mb-2">
									Consejo
								</h4>
								<p className="text-gray-700 dark:text-gray-300">
									Para una respuesta más rápida, incluye tu número de empleado y departamento en tu mensaje.
								</p>
							</Card>
						</motion.div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ContactPage;
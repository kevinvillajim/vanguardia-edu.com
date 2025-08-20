// src/pages/public/Cursos/Cursos.jsx
import {useState, useEffect} from "react";
import {motion, AnimatePresence} from "motion/react";
import {Card, Button} from "../../../components/ui";
import {CourseCard} from "@/shared/components/courses/CourseCard/CourseCard";
import PublicHeader from "../../../components/layout/Header/PublicHeader";

const CursosPage = () => {
	const [selectedCategory, setSelectedCategory] = useState("todos");
	const [searchTerm, setSearchTerm] = useState("");

	const categories = [
		{id: "todos", name: "Todos los Cursos", count: 24},
		{id: "tecnologia", name: "Tecnología", count: 8},
		{id: "negocios", name: "Negocios Digitales", count: 6},
		{id: "diseno", name: "Diseño & UX", count: 5},
		{id: "marketing", name: "Marketing Digital", count: 5}
	];

	const courses = [
		{
			id: 1,
			title: "Desarrollo Web Full Stack con React y Node.js",
			description: "Domina las tecnologías más demandadas para crear aplicaciones web modernas desde cero hasta producción.",
			image: "/curso1.webp",
			progress: 0,
			totalLessons: 45,
			completedLessons: 0,
			duration: "12 semanas",
			difficulty: "Intermedio",
			instructor: "Ana Rodríguez",
			tags: ["JavaScript", "React", "Node.js"],
			category: "tecnologia",
			isNew: true,
			link: "/student/course/1"
		},
		{
			id: 2,
			title: "Inteligencia Artificial y Machine Learning",
			description: "Aprende a implementar algoritmos de IA y ML para resolver problemas reales del mundo empresarial.",
			image: "/curso4.png",
			progress: 65,
			totalLessons: 38,
			completedLessons: 25,
			duration: "10 semanas",
			difficulty: "Avanzado",
			instructor: "Dr. Carlos Mendoza",
			tags: ["Python", "AI", "Machine Learning"],
			category: "tecnologia"
		},
		{
			id: 3,
			title: "E-commerce y Negocios Digitales",
			description: "Crea y escala tu negocio online con estrategias probadas de comercio electrónico y marketing digital.",
			image: "/curso5.jpeg",
			progress: 30,
			totalLessons: 28,
			completedLessons: 8,
			duration: "8 semanas",
			difficulty: "Intermedio",
			instructor: "Laura García",
			tags: ["E-commerce", "Marketing", "Emprendimiento"],
			category: "negocios"
		},
		{
			id: 4,
			title: "UX/UI Design con Figma",
			description: "Diseña experiencias digitales excepcionales y crea interfaces atractivas con las herramientas más actuales.",
			image: "/curso6.png",
			progress: 0,
			totalLessons: 32,
			completedLessons: 0,
			duration: "9 semanas",
			difficulty: "Principiante",
			instructor: "Sofía Martínez",
			tags: ["Figma", "UX", "UI"],
			category: "diseno",
			isNew: true
		},
		{
			id: 5,
			title: "Marketing Digital y Redes Sociales",
			description: "Domina las estrategias de marketing más efectivas para hacer crecer tu marca en el entorno digital.",
			image: "/c1Banner1.jpg",
			progress: 85,
			totalLessons: 25,
			completedLessons: 21,
			duration: "7 semanas",
			difficulty: "Intermedio",
			instructor: "Roberto Silva",
			tags: ["Marketing", "Redes Sociales", "SEO"],
			category: "marketing"
		},
		{
			id: 6,
			title: "Data Science con Python",
			description: "Conviértete en un científico de datos y aprende a extraer insights valiosos de grandes volúmenes de información.",
			image: "/c2Banner1.jpg",
			progress: 0,
			totalLessons: 42,
			completedLessons: 0,
			duration: "11 semanas",
			difficulty: "Intermedio",
			instructor: "Dr. Carmen Vásquez",
			tags: ["Python", "Data Science", "Análisis"],
			category: "tecnologia"
		},
		{
			id: 7,
			title: "Blockchain y Criptomonedas",
			description: "Entiende la tecnología blockchain y el ecosistema de criptomonedas para aprovechar las oportunidades del futuro financiero.",
			image: "/c3Banner1.jpg",
			progress: 45,
			totalLessons: 20,
			completedLessons: 9,
			duration: "6 semanas",
			difficulty: "Avanzado",
			instructor: "Dr. Fernando Morales",
			tags: ["Blockchain", "Crypto", "Fintech"],
			category: "tecnologia"
		},
		{
			id: 8,
			title: "Growth Hacking y Analytics",
			description: "Acelera el crecimiento de tu negocio con técnicas avanzadas de growth hacking y análisis de datos.",
			image: "/phishingCoop.jpg",
			progress: 0,
			totalLessons: 18,
			completedLessons: 0,
			duration: "5 semanas",
			difficulty: "Avanzado",
			instructor: "David Torres",
			tags: ["Growth", "Analytics", "Conversión"],
			category: "marketing",
			isNew: true
		}
	];

	const filteredCourses = courses.filter(course => {
		const matchesCategory = selectedCategory === "todos" || course.category === selectedCategory;
		const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
							 course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
		return matchesCategory && matchesSearch;
	});

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900">
			<PublicHeader />
			{/* Hero Section */}
			<section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-500 via-secondary-800 to-primary-900 overflow-hidden">
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
						Cursos de{" "}
						<span className="text-acent-500">Tecnología e Innovación</span>
					</motion.h1>
					
					<motion.p
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8, delay: 0.2}}
						className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
					>
						Descubre cursos de alta calidad diseñados por expertos de la industria para impulsar tu carrera en tecnología, negocios digitales y marketing
					</motion.p>

					{/* Search Bar */}
					<motion.div
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8, delay: 0.4}}
						className="max-w-2xl mx-auto"
					>
						<div className="relative">
							<input
								type="text"
								placeholder="Buscar cursos..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-lg text-lg focus:ring-4 focus:ring-acent-500/50 focus:outline-none"
							/>
							<svg
								className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Categories & Courses */}
			<section className="py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Category Filter */}
					<motion.div
						initial={{opacity: 0, y: 30}}
						animate={{opacity: 1, y: 0}}
						transition={{duration: 0.8}}
						className="mb-12"
					>
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
							Categorías de Cursos
						</h2>
						<div className="flex flex-wrap gap-4">
							{categories.map((category) => (
								<button
									key={category.id}
									onClick={() => setSelectedCategory(category.id)}
									className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
										selectedCategory === category.id
											? "bg-primary-500 text-white shadow-lg scale-105"
											: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
									}`}
								>
									{category.name}
									<span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
										{category.count}
									</span>
								</button>
							))}
						</div>
					</motion.div>

					{/* Courses Grid */}
					<motion.div
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						transition={{duration: 0.8, delay: 0.2}}
					>
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
								{filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
							</h3>
							<select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none">
								<option>Más recientes</option>
								<option>Por dificultad</option>
								<option>Por duración</option>
								<option>Más populares</option>
							</select>
						</div>

						<AnimatePresence mode="wait">
							<motion.div
								key={selectedCategory}
								initial={{opacity: 0, y: 20}}
								animate={{opacity: 1, y: 0}}
								exit={{opacity: 0, y: -20}}
								transition={{duration: 0.5}}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
							>
								{filteredCourses.map((course, index) => (
									<motion.div
										key={course.id}
										initial={{opacity: 0, y: 30}}
										animate={{opacity: 1, y: 0}}
										transition={{duration: 0.5, delay: index * 0.1}}
									>
										<CourseCard
											course={{
												...course,
												slug: course.id.toString(),
												banner_image: course.image,
												teacher: { name: course.instructor, avatar: null },
												difficulty_level: course.difficulty.toLowerCase(),
												duration_hours: parseInt(course.duration.split(' ')[0]) || 0,
												total_lessons: course.totalLessons,
												price: 0,
												rating: 4.5,
												enrollment_count: Math.floor(Math.random() * 100)
											}}
										/>
									</motion.div>
								))}
							</motion.div>
						</AnimatePresence>

						{filteredCourses.length === 0 && (
							<motion.div
								initial={{opacity: 0, scale: 0.9}}
								animate={{opacity: 1, scale: 1}}
								transition={{duration: 0.5}}
								className="text-center py-16"
							>
								<div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
									<svg
										className="w-12 h-12 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
										/>
									</svg>
								</div>
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
									No se encontraron cursos
								</h3>
								<p className="text-gray-600 dark:text-gray-400 mb-6">
									Intenta ajustar tu búsqueda o filtros para encontrar más cursos
								</p>
								<Button variant="primary" onClick={() => {setSearchTerm(""); setSelectedCategory("todos");}}>
									Limpiar Filtros
								</Button>
							</motion.div>
						)}
					</motion.div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-gray-50 dark:bg-gray-800">
				<div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{opacity: 0, y: 30}}
						whileInView={{opacity: 1, y: 0}}
						transition={{duration: 0.8}}
						viewport={{once: true}}
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
							¿Buscas algo específico?
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
							Sugerimos nuevos cursos mensualmente según las tendencias del mercado
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
							<Button variant="primary" size="lg">
								Solicitar Curso Personalizado
							</Button>
							<Button variant="outline" size="lg">
								Hablar con un Asesor
							</Button>
						</div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default CursosPage;
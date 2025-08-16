const cursos = [
	{
		id: 0,
		title: "Protección de datos personales",
		type: "Seguridad de la Información",
		content:
			"Este curso abarca los aspectos fundamentales de la protección de datos personales y sus definiciones, así como medidas de protección, destacando su importancia y prevención.",
		img: "/curso4.png",
		link: "/estudiante/cursos/curso1",
		material: [
			{
				title: "Pdf Referencial",
				descripcion:
					"Este archivo es el PDF referencial que se utilizó para la creación del curso.",
				img: "/pdf.webp",
				archivo: "/proteccionDatos.pdf",
			},
			{
				title: "Ley Organica de Protección de Datos Personales",
				descripcion: "Ley actualizada y vigente, aprobada en mayo de 2021",
				img: "/pdf.webp",
				archivo: "/lopdp.pdf",
			},
		],
		units: [
			{
				unit: "Unidad 1: Definiciónes Importantes",
				url: "/estudiante/cursos/curso1/unidad1",
				value: "Unidad1",
				modules: [
					{
						modulo: "1.1 Datos Personales",
						url: "/estudiante/cursos/curso1/unidad1#modulo1",
					},
					{
						modulo: "1.2 Datos Sensibles",
						url: "/estudiante/cursos/curso1/unidad1#modulo2",
					},
				],
			},
			{
				unit: "Unidad 2: Integrantes del Sistema de Protección de Datos Personales",
				url: "/estudiante/cursos/curso1/unidad2",
				value: "Unidad2",
				modules: [
					{
						modulo: "2.1 Titular",
						url: "/estudiante/cursos/curso1/unidad2#modulo1",
					},
					{
						modulo: "2.2 Responsable de tratamiento de datos personales",
						url: "/estudiante/cursos/curso1/unidad2#modulo2",
					},
					{
						modulo: "2.3 Delegado de protección de datos",
						url: "/estudiante/cursos/curso1/unidad2#modulo3",
					},
					{
						modulo: "2.4 Encargado del tratamiento de datos personales",
						url: "/estudiante/cursos/curso1/unidad2#modulo4",
					},
					{
						modulo: "2.5 Destinatario",
						url: "/estudiante/cursos/curso1/unidad2#modulo5",
					},
					{
						modulo: " 2.6 Autoridad de Protección de Datos Personales",
						url: "/estudiante/cursos/curso1/unidad2#modulo6",
					},
					{
						modulo: "2.7 Consentimiento",
						url: "/estudiante/cursos/curso1/unidad2#modulo7",
					},
				],
			},
			{
				unit: "Unidad 3: Derechos del interesado",
				url: "/estudiante/cursos/curso1/unidad3",
				value: "Unidad3",
				modules: [
					{
						modulo: "3.1 Derechos",
						url: "/estudiante/cursos/curso1/unidad3#modulo1",
					},
					{
						modulo: "3.2 Amenazas Actuales",
						url: "/estudiante/cursos/curso1/unidad3#modulo2",
					},
					{
						modulo: "3.3 ¿Que hacer para no ser víctimas?",
						url: "/estudiante/cursos/curso1/unidad3#modulo3",
					},
				],
			},
		],
	},
	{
		id: 1,
		title: "Introducción a la seguridad y fraudes financieros",
		type: "Seguridad de la Información",
		content:
			"Principales ataques de ciberdelincuentes y estafadores, tipos de fraudes, métodos de prevención y manejo seguro de transacciones.",
		img: "/curso5.jpeg",
		link: "/estudiante/cursos/curso2",
		material: [
			{
				title: "Pdf Referencial",
				descripcion:
					"Este archivo es el PDF referencial que se utilizó para la creación del curso.",
				img: "/pdf.webp",
				archivo: "/proteccionDatos.pdf",
			},
			{
				title: "Ley Organica de Protección de Datos Personales",
				descripcion: "Ley actualizada y vigente, aprobada en mayo de 2021",
				img: "/pdf.webp",
				archivo: "/lopdp.pdf",
			},
		],
		units: [
			{
				unit: "Unidad 1: Principales Tipos de Fraudes en Canales Digitales Financieros  ",
				url: "/estudiante/cursos/curso2/unidad1",
				value: "Unidad1",
				modules: [
					{
						modulo: "1.1 Introducción",
						url: "/estudiante/cursos/curso2/unidad1#modulo1",
					},
					{
						modulo: "1.2 Phishing",
						url: "/estudiante/cursos/curso2/unidad1#modulo2",
					},
					{
						modulo: "1.3 Malware",
						url: "/estudiante/cursos/curso2/unidad1#modulo3",
					},
					{
						modulo: "1.4 Robo de Identidad",
						url: "/estudiante/cursos/curso2/unidad1#modulo4",
					},
					{
						modulo: "1.5 Fraude en el comercio electrónico",
						url: "/estudiante/cursos/curso2/unidad1#modulo5",
					},
				],
			},
			{
				unit: "Unidad 2: Identificación de señales de fraude",
				url: "/estudiante/cursos/curso2/unidad2",
				value: "Unidad2",
				modules: [
					{
						modulo: "2.1 Identificación de señales",
						url: "/estudiante/cursos/curso2/unidad2#modulo1",
					},
					{
						modulo: "2.2 Reconocimiento",
						url: "/estudiante/cursos/curso2/unidad2#modulo2",
					},
				],
			},
			{
				unit: "Unidad 3: Medidas de seguridad",
				url: "/estudiante/cursos/curso2/unidad3",
				value: "Unidad3",
				modules: [
					{
						modulo: "3.1 Mejorar la seguridad en cuentas y dispositivos",
						url: "/estudiante/cursos/curso2/unidad3#modulo1",
					},
					{
						modulo: "3.2 Manejo seguro de transacciones y pagos en linea",
						url: "/estudiante/cursos/curso2/unidad3#modulo2",
					},
				],
			},
		],
	},
];

export default cursos;

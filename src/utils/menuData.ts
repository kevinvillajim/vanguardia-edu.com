export const sideBarOptions = {
	admin: [
		{link: "/admin/control", icon: "monitoring", name: "Dashboard"},
		{link: "/admin/usuarios", icon: "manage_accounts", name: "Usuarios"},
		{link: "/admin/cursos", icon: "menu_book", name: "Cursos"},
		{link: "/admin/configuracion", icon: "settings", name: "Configuración"},
		{link: "/admin/reportes", icon: "analytics", name: "Reportes"},
		{link: "/admin/certificaciones", icon: "military_tech", name: "Certificaciones"},
	],
	student: [
		{link: "/user/dashboard", icon: "dashboard", name: "Dashboard"},
		{link: "/user/cursos", icon: "menu_book", name: "Mis Cursos"},
		{link: "/user/calificaciones", icon: "grade", name: "Calificaciones"},
		{link: "/user/certificaciones", icon: "military_tech", name: "Certificaciones"},
		{link: "/user/perfil", icon: "person", name: "Perfil"},
		{link: "/user/configuracion", icon: "settings", name: "Configuración"},
	],
	teacher: [
		{link: "/profesor/dashboard", icon: "dashboard", name: "Dashboard"},
		{link: "/profesor/cursos", icon: "menu_book", name: "Mis Cursos"},
		{link: "/profesor/cursos/crear", icon: "add_circle", name: "Crear Curso"},
		{link: "/profesor/calificaciones", icon: "grade", name: "Calificaciones"},
		{link: "/profesor/reportes", icon: "analytics", name: "Reportes"},
		{link: "/profesor/perfil", icon: "person", name: "Perfil"},
		{link: "/profesor/configuracion", icon: "settings", name: "Configuración"},
	],
	// Legacy support
	Estudiante: [
		{link: "/user/dashboard", icon: "dashboard", name: "Dashboard"},
		{link: "/user/cursos", icon: "menu_book", name: "Mis Cursos"},
		{link: "/user/certificaciones", icon: "military_tech", name: "Certificaciones"},
	],
};

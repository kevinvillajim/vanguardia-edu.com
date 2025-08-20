// src/contexts/SidebarContext.jsx
import {createContext, useContext, useState, useEffect} from "react";
import PropTypes from "prop-types";

// Crear contexto
const SidebarContext = createContext();

// Hook para usar el contexto
export function useSidebar() {
	const context = useContext(SidebarContext);
	if (!context) {
		throw new Error("useSidebar must be used within a SidebarProvider");
	}
	return context;
}

// Proveedor del contexto
export function SidebarProvider({children}) {
	// Función para obtener el estado inicial del sidebar
	const getInitialSidebarState = () => {
		try {
			// Verificar si estamos en mobile/tablet
			const isMobile = window.innerWidth <= 768;
			const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
			
			// En móvil, siempre empezar cerrado
			if (isMobile) {
				return false;
			}
			
			// En tablet y desktop, usar preferencia guardada
			const savedState = localStorage.getItem("sidebarOpen");
			if (savedState !== null) {
				return JSON.parse(savedState);
			}
			
			// Estado por defecto: cerrado en tablet, abierto en desktop
			return !isTablet;
		} catch (error) {
			console.warn("Error reading sidebar state from localStorage:", error);
			// Fallback: cerrado en mobile/tablet, abierto en desktop
			return window.innerWidth > 1024;
		}
	};

	const [sidebarOpen, setSidebarOpenState] = useState(getInitialSidebarState);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	// Función para cambiar el estado del sidebar
	const setSidebarOpen = (open) => {
		setSidebarOpenState(open);
		// Guardar en localStorage solo si no es móvil
		if (!isMobile) {
			try {
				localStorage.setItem("sidebarOpen", JSON.stringify(open));
			} catch (error) {
				console.warn("Error saving sidebar state to localStorage:", error);
			}
		}
	};

	// Función para alternar el sidebar
	const toggleSidebar = () => {
		setSidebarOpen(!sidebarOpen);
	};

	// Función para cerrar el sidebar (útil para móvil)
	const closeSidebar = () => {
		setSidebarOpen(false);
	};

	// Función para abrir el sidebar
	const openSidebar = () => {
		setSidebarOpen(true);
	};

	// Escuchar cambios en el tamaño de la ventana
	useEffect(() => {
		const handleResize = () => {
			const newIsMobile = window.innerWidth <= 768;
			const newIsTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
			
			setIsMobile(newIsMobile);
			
			// En móvil, siempre cerrar el sidebar
			if (newIsMobile) {
				setSidebarOpenState(false);
			} 
			// Al cambiar de móvil a tablet/desktop, restaurar preferencia
			else if (isMobile && !newIsMobile) {
				const savedState = localStorage.getItem("sidebarOpen");
				if (savedState !== null) {
					setSidebarOpenState(JSON.parse(savedState));
				} else {
					// Estado por defecto para tablet/desktop
					setSidebarOpenState(!newIsTablet);
				}
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [isMobile]);

	// Auto-cerrar sidebar en móvil cuando se navega (si es necesario)
	const handleNavigation = () => {
		if (isMobile && sidebarOpen) {
			closeSidebar();
		}
	};

	const value = {
		// Estado
		sidebarOpen,
		isMobile,
		
		// Acciones
		setSidebarOpen,
		toggleSidebar,
		closeSidebar,
		openSidebar,
		handleNavigation,
		
		// Utilidades
		isDesktop: !isMobile && window.innerWidth > 1024,
		isTablet: !isMobile && window.innerWidth <= 1024,
	};

	return (
		<SidebarContext.Provider value={value}>
			{children}
		</SidebarContext.Provider>
	);
}

SidebarProvider.propTypes = {
	children: PropTypes.node.isRequired,
};

export default SidebarContext;
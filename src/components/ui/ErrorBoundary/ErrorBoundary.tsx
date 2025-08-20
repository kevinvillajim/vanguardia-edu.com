// src/components/ui/ErrorBoundary/ErrorBoundary.jsx
import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = {hasError: false, error: null, errorInfo: null};
	}

	static getDerivedStateFromError(error) {
		// Actualizar el estado para mostrar la UI de error
		return {hasError: true};
	}

	componentDidCatch(error, errorInfo) {
		// Log del error para debugging
		console.error("ErrorBoundary capturó un error:", error, errorInfo);
		
		this.setState({
			error: error,
			errorInfo: errorInfo,
		});

		// Aquí podrías enviar el error a un servicio de monitoreo
		// como Sentry, LogRocket, etc.
		if (this.props.onError) {
			this.props.onError(error, errorInfo);
		}
	}

	handleReload = () => {
		this.setState({hasError: false, error: null, errorInfo: null});
		if (this.props.onReload) {
			this.props.onReload();
		}
	};

	render() {
		if (this.state.hasError) {
			// UI de error personalizada
			if (this.props.fallback) {
				return this.props.fallback(
					this.state.error,
					this.state.errorInfo,
					this.handleReload
				);
			}

			// UI de error por defecto
			return (
				<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
					<div className="max-w-md w-full space-y-8 text-center">
						<div>
							<div className="mx-auto h-12 w-12 text-red-600 mb-4">
								<svg
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
									/>
								</svg>
							</div>
							<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
								Oops! Algo salió mal
							</h2>
							<p className="mt-2 text-center text-sm text-gray-600">
								Ha ocurrido un error inesperado en la aplicación.
							</p>
						</div>

						<div className="mt-8 space-y-4">
							<button
								onClick={this.handleReload}
								className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Intentar de nuevo
							</button>

							<button
								onClick={() => window.location.reload()}
								className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
							>
								Recargar página
							</button>
						</div>

						{process.env.NODE_ENV === "development" && this.state.error && (
							<details className="mt-8 text-left">
								<summary className="cursor-pointer text-sm font-medium text-gray-900 hover:text-gray-700">
									Detalles técnicos (desarrollo)
								</summary>
								<div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md">
									<p className="text-sm font-medium text-red-800 mb-2">
										Error:
									</p>
									<pre className="text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
										{this.state.error.toString()}
									</pre>
									{this.state.errorInfo && (
										<>
											<p className="text-sm font-medium text-red-800 mt-4 mb-2">
												Stack trace:
											</p>
											<pre className="text-xs text-red-700 overflow-x-auto whitespace-pre-wrap">
												{this.state.errorInfo.componentStack}
											</pre>
										</>
									)}
								</div>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

ErrorBoundary.propTypes = {
	children: PropTypes.node.isRequired,
	fallback: PropTypes.func,
	onError: PropTypes.func,
	onReload: PropTypes.func,
};

export default ErrorBoundary;
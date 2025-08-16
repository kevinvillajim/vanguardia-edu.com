import PropTypes from "prop-types";
import {useState, useRef, useEffect} from "react";

function Modal2({setShowModal, content}) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
			<div className="bg-white px-4 py-4 md:px-8 md:py-8 rounded-lg relative w-full max-w-[85%]">
				<div className="w-full text-end">
					<span
						className="text-black material-symbols-outlined cursor-pointer"
						onClick={() => {
							setShowModal(false);
						}}
					>
						close
					</span>
				</div>
				<div className="flex justify-center items-center overflow-hidden">
					{content}
				</div>
			</div>
		</div>
	);
}

Modal2.propTypes = {
	setShowModal: PropTypes.func.isRequired,
	content: PropTypes.node.isRequired,
};

function Image({img}) {
	const [showModal, setShowModal] = useState(false);
	const [zoom, setZoom] = useState(1); // Estado para el nivel de zoom
	const [isPanning, setIsPanning] = useState(false); // Estado para manejar el arrastre
	const [startX, setStartX] = useState(0); // Coordenada X inicial
	const [startY, setStartY] = useState(0); // Coordenada Y inicial
	const [offsetX, setOffsetX] = useState(0); // Desplazamiento X
	const [offsetY, setOffsetY] = useState(0); // Desplazamiento Y
	const imgRef = useRef(null);

	const handleZoom = (e) => {
		e.preventDefault();
		setZoom((prevZoom) => {
			const newZoom = prevZoom + e.deltaY * -0.001;
			return Math.min(Math.max(newZoom, 1), 3); // Limitar el zoom entre 1x y 3x
		});
	};

	const handleMouseDown = (e) => {
		setIsPanning(true);
		setStartX(e.clientX - offsetX);
		setStartY(e.clientY - offsetY);
	};

	const handleMouseMove = (e) => {
		if (isPanning) {
			const x = e.clientX - startX;
			const y = e.clientY - startY;
			setOffsetX(x);
			setOffsetY(y);
		}
	};

	const handleMouseUp = () => {
		setIsPanning(false);
	};

	const [backgroundSize, setBackgroundSize] = useState("contain");

	useEffect(() => {
		const updateBackgroundSize = () => {
			if (window.matchMedia("(max-width: 768px)").matches) {
				setBackgroundSize("cover");
			} else {
				setBackgroundSize("contain");
			}
		};

		updateBackgroundSize(); // Ejecutar una vez al cargar el componente
		window.addEventListener("resize", updateBackgroundSize); // Escuchar cambios de tamaño

		return () => window.removeEventListener("resize", updateBackgroundSize); // Limpieza al desmontar
	}, []);

	return (
		<>
			<div
				className="relative h-[29rem] bg-[gray] rounded-lg mx-[2rem] my-[2rem]"
				style={{
					backgroundImage: `url(${img})`,
					backgroundPosition: "center",
					backgroundSize: backgroundSize,
					backgroundRepeat: "no-repeat",
				}}
			>
				<button
					onClick={() => {
						setShowModal(true);
					}}
					className="absolute bottom-2 right-2 p-2 w-[40px] h-[40px] bg-white rounded-full shadow-lg"
				>
					<span className="text-black material-symbols-outlined">zoom_in</span>
				</button>
				{showModal && (
					<Modal2
						content={
							<>
								<div
									className="w-[90%] max-h-[90vh] overflow-hidden flex justify-center items-center"
									onWheel={handleZoom} // Para el zoom con scroll del mouse
									onMouseDown={handleMouseDown} // Para iniciar el arrastre
									onMouseMove={handleMouseMove} // Para mover la imagen durante el arrastre
									onMouseUp={handleMouseUp} // Para finalizar el arrastre
									style={{
										transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`, // Aplicar el desplazamiento y zoom
										transition: "transform 0.2s ease-out", // Transición suave para el zoom
									}}
								>
									<img
										ref={imgRef}
										className="object-contain"
										src={img}
										alt="Zoomed In"
									/>
								</div>
							</>
						}
						setShowModal={setShowModal}
					/>
				)}
			</div>
		</>
	);
}

Image.propTypes = {
	img: PropTypes.string.isRequired,
};

export default Image;

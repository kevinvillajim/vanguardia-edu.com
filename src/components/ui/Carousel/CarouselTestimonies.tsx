import {useState} from "react";
import PropTypes from "prop-types";

function CarruselTestimonies({photos, currentPhotoIndex}) {
	const [currentIndex, setCurrentIndex] = useState(currentPhotoIndex);

	const goToNextPhoto = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
	};

	const goToPrevPhoto = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + photos.length) % photos.length
		);
	};

	return (
		<>
			<div className="flex flex-col w-[75%]">
				<img
					className="object-cover position-center w-[1500px] h-[400px] rounded-lg"
					src={photos[currentIndex].img}
					alt={photos[currentIndex].title}
				/>

				<div className="flex justify-center mt-[1rem]">
					<div
						className="bg-[black] bg-opacity-60 rounded-full w-[50px] h-[50px] border border-[4px] border-white flex justify-center items-center cursor-pointer buttonsCarrousel"
						onClick={goToPrevPhoto}
					>
						<span
							className="material-symbols-outlined text-[white] flex "
							style={{marginLeft: "calc(50% - 12px)"}}
						>
							arrow_back_ios
						</span>
					</div>

					<div
						className="bg-[black] bg-opacity-60 rounded-full w-[50px] h-[50px] border border-[4px] border-white flex justify-center items-center cursor-pointer buttonsCarrousel"
						onClick={goToNextPhoto}
					>
						<span className="material-symbols-outlined text-[white] flex ">
							arrow_forward_ios
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

export default CarruselTestimonies;

CarruselTestimonies.propTypes = {
	photos: PropTypes.array,
	currentPhotoIndex: PropTypes.number.isRequired,
};

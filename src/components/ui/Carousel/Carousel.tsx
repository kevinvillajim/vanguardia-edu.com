import { useState } from "react";
import PropTypes from "prop-types";

function Carrusel({ photos, currentPhotoIndex }) {
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
      <div
        className="img-carr flex items-center justify-between bg-[#CDCDCD] w-[screen] h-[36rem] carrousel-container"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.3)), url(${photos[currentIndex].img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-[8rem] text-container">
          <h1 className="text-[white] text-[32px] font-bold">
            {photos[currentIndex].title}
          </h1>
          <h2 className="text-[white] text-[20px] font-semibold">
            {photos[currentIndex].subtitle}
          </h2>
          <p className="text-[white] text-[18px] w-[50rem] font-thin text-text">
            {photos[currentIndex].description}
          </p>
        </div>
        <div
          className="absolute left-[1rem] bg-[black] bg-opacity-60 rounded-full w-[50px] h-[50px] border border-[4px] border-white flex justify-center items-center cursor-pointer buttonsCarrousel"
          onClick={goToPrevPhoto}
        >
          <span
            className="material-symbols-outlined text-[white] flex "
            style={{
              marginLeft: "calc(50% - 12px)",
            }}
          >
            arrow_back_ios
          </span>
        </div>

        <div
          className="absolute right-[1rem] bg-[black] bg-opacity-60 rounded-full w-[50px] h-[50px] border border-[4px] border-white flex justify-center items-center cursor-pointer buttonsCarrousel"
          onClick={goToNextPhoto}
        >
          <span className="material-symbols-outlined text-[white] flex ">
            arrow_forward_ios
          </span>
        </div>
      </div>
    </>
  );
}

export default Carrusel;

Carrusel.propTypes = {
  photos: PropTypes.array,
  currentPhotoIndex: PropTypes.number.isRequired,
};

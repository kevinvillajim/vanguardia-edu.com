import PropTypes from "prop-types";

function Banner({ img, title }) {
  return (
    <>
      <div
        className="h-[28rem] bg-black bg-fixed"
        style={{
          backgroundImage: `url(${img})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black bg-opacity-50 h-[100%] w-[100%] flex justify-left items-center relative">
          <div className="w-[60%] flex px-[2rem]">
            <p className="font-righteous text-white font-bold text-4xl text-left">
              {title}
            </p>
          </div>
          <div className="w-[2rem] h-[2rem] bottom-5 right-[50%] flex justify-center absolute">
            <span className="material-symbols-outlined text-6xl text-[white] cursor-pointer text-center ">
              keyboard_arrow_down
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Banner;

Banner.propTypes = {
  img: PropTypes.string,
  title: PropTypes.string.isRequired,
};

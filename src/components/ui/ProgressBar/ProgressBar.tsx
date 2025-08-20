import PropTypes from "prop-types";

export default function ProgressBar({ totalValue, text }) {
  let value = totalValue;

  const getColor = (value) => {
    if (value <= 33) return "bg-red-500";
    if (value <= 66) return "bg-yellow-500";
    if (value <= 99) return "bg-green-500";
    return "bg-blue-500";
  };

  if (value > 100) {
    value = 100;
  }

  const color = getColor(value);
  return (
    <>
      <div className="w-[100%]">
        <div className="flex gap-2 items-center mt-[0.3rem]">
          <div className="w-full rounded-full h-2 bg-gray-200">
            <div
              className={`${color} h-2 rounded-full`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <div className={`flex justify-end text-sm text-${text}`}>
            {totalValue}%
          </div>
        </div>
      </div>
    </>
  );
}

ProgressBar.propTypes = {
	totalValue: PropTypes.number,
	text: PropTypes.string,
};


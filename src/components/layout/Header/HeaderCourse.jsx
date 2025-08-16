import PropTypes from "prop-types";

function HeaderCourse({title}) {
	let colorBg = "#000";
	let textColor = "[#fff]";

	return (
		<>
			<header
				className={`w-[100%] h-[5rem] bg-[${colorBg}] flex justify-between items-center px-[2rem] shadow-sm`}
			>
				<div id="menu-principal" className="flex items-center">
					<div className="w-[150px] h-auto">
						<img
							src="/logo.png"
							alt="logo"
							className="w-full h-full object-cover"
						/>
					</div>
					<h2 className={`ml-[3rem] text-${textColor} text-2xl`}>{title}</h2>
				</div>
				<a href="/estudiante/dashboard">
					<div className="flex cursor-pointer animatedBig">
						<span className="material-symbols-outlined text-white text-4xl">
							close
						</span>
					</div>
				</a>
			</header>
		</>
	);
}

HeaderCourse.propTypes = {};

export default HeaderCourse;

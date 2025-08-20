import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";

function SideBar({logo, avatar, enterprise, title, name, options, rol}) {
	let colorBg = "#404242";
	let textColor = "[gray-900]";
	let bgImg = "/bgImg.jpg";
	const location = useLocation();

	const isActiveLink = (link) => {
		return location.pathname === link || location.pathname.startsWith(link + '/');
	};

	return (
		<>
			<div
				id="left-menu"
				className={`bg-[${colorBg}] w-[100%] h-dvh`}
				style={{
					backgroundImage: `url(${bgImg})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
				}}
			>
				<div className="bg-gradient-to-t from-gray-500 to-white bg-opacity-90 h-[100%]">
					<div className="flex items-center py-[6rem] justify-center">
						<div className="md:w-[170px] flex justify-center overflow-hidden">
							<img
								alt="logo"
								src={logo}
								className="w-[100%] h-[100%] object-cover"
							/>
						</div>
						<h1 className={`text-${textColor} ml-[0.5rem] text-[20px]`}>
							{enterprise}
						</h1>
					</div>
					<hr className={`border-${textColor}`} />
					<div className="py-[1rem] flex flex-col items-center px-[2rem]">
						<div className="w-[70px] h-[70px] flex justify-center items-center rounded-full overflow-hidden border-4 border-[#95c11f] mb-[0.5rem]">
							<img
								alt="avatar"
								src={avatar || "/avatarDef.png"}
								className="w-full h-full object-cover"
							/>
						</div>
						<h2
							className={`mt-[0.7rem] text-center text-${textColor} text-[15px]`}
						>
							{" "}
							{name}{" "}
						</h2>
						<h2 className={`mt-[0.7rem] text-${textColor} text-[15px]`}>
							<b>{rol}</b>
						</h2>
					</div>
					<hr className={`border-${textColor}`} />
					<div className="py-[1rem] px-[2rem]">
						<h2 className={`text-center text-${textColor}`}>{title}</h2>
						<div className="flex justify-center h-[20rem]">
							<div className="">
								{(options[rol] ?? []).map((opcion, key) => (
									<Link to={opcion.link} key={key}>
										<div className={`mb-[0.1rem] animatedBg py-[0.02px] px-[0.4rem] md:px-[1rem] rounded-lg cursor-pointer transition-all duration-200 ${
											isActiveLink(opcion.link) 
												? 'bg-acent-500/20 border-l-4 border-acent-500' 
												: 'hover:bg-white/10'
										}`}>
											<h3
												className={`text-${textColor} flex my-[1rem] text-[12px] md:text-[16px] items-center ${
													isActiveLink(opcion.link) ? 'font-semibold text-acent-500' : ''
												}`}
											>
												<span className="material-symbols-outlined mr-[1rem]">
													{opcion.icon}
												</span>
												{opcion.name}
											</h3>
										</div>
									</Link>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

SideBar.propTypes = {
	logo: PropTypes.string,
	avatar: PropTypes.string,
	enterprise: PropTypes.string,
	title: PropTypes.string,
	options: PropTypes.object,
	name: PropTypes.string,
	rol: PropTypes.string,
};

export default SideBar;

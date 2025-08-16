import PropTypes from "prop-types";

function HeaderIn({
	showMenu,
	setShowMenu,
	setShowModal,
	name,
	avatar,
	colorBg,
	textColor,
}) {
	const handleMenuClick = () => {
		setShowMenu && setShowMenu((prevShowMenu) => !prevShowMenu);
	};
	const handleModalClick = () => {
		setShowModal && setShowModal((prevShowModal) => !prevShowModal);
	};

	return (
		<>
			<header
				className={`w-full h-16 ${
					colorBg ? `bg-${colorBg}` : "bg-black"
				} flex justify-between items-center px-8 shadow-sm`}
			>
				<div
					id="menu-principal"
					className="flex cursor-pointer items-center animatedBig"
					onClick={handleMenuClick}
				>
					<span
						className={`material-symbols-outlined ${
							textColor ? `text-${textColor}` : "text-white"
						}`}
					>
						{showMenu ? "menu_open" : "menu"}
					</span>
					<h2
						className={`hidden md:inline ml-4 ${
							textColor ? `text-${textColor}` : "text-white"
						}`}
					>
						Home
					</h2>
				</div>
				<div
					className="flex cursor-pointer animatedBig"
					id="show-modal"
					onClick={handleModalClick}
				>
					<img
						src={avatar ? avatar : "/avatarDef.png"}
						alt="avatar1"
						className="w-10 h-10 rounded-full object-cover"
					/>
					<div className="hidden md:flex items-center">
						<h2
							className={`ml-4 ${
								textColor ? `text-${textColor}` : "text-white"
							}`}
						>
							{name}
						</h2>
						<span
							id="more"
							className={`material-symbols-outlined ${
								textColor ? `text-${textColor}` : "text-white"
							}`}
						>
							expand_more
						</span>
					</div>
				</div>
			</header>
		</>
	);
}

HeaderIn.propTypes = {
	setShowMenu: PropTypes.func,
	showMenu: PropTypes.bool,
	setShowModal: PropTypes.func,
	name: PropTypes.string,
	avatar: PropTypes.string,
	colorBg: PropTypes.string,
	textColor: PropTypes.string,
};

export default HeaderIn;

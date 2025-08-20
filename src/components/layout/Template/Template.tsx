import {useState} from "react";
import SideBar from "../Sidebar/SideBar";
import ModalUser from "../../ui/Modal/ModalUser";
import HeaderIn from "../Header/HeaderIn";
import PropTypes from "prop-types";
import {sideBarOptions} from "../../../utils/menuData";
import {getFromLocalStorage} from "../../../utils/crypto";

function Template({content, rol}) {
	const [showMenu, setShowMenu] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const user = JSON.parse(getFromLocalStorage("user"));

	const logo = "/logo.png";

	return (
		<>
			<div
				className={
					showMenu ? "grid grid-cols-3 md:grid-cols-8 relative" : "flex"
				}
			>
				<div
					className={
						showMenu
							? "col-span-1 md:col-span-1 h-screen sticky top-0"
							: "hidden"
					}
				>
					<SideBar
						logo={logo}
						avatar={user.avatar}
						options={sideBarOptions}
						name={user.name}
						rol={rol}
					/>
				</div>
				<div
					className={showMenu ? "w-full col-span-2 md:col-span-7" : "w-screen"}
				>
					<div>
						<HeaderIn
							name={user.name}
							avatar={user.avatar}
							setShowMenu={setShowMenu}
							showMenu={showMenu}
							setShowModal={setShowModal}
						/>
					</div>
					<div
						className={`${
							showModal
								? "opacity-100 scale-100 duration-300"
								: "opacity-0 scale-y-90 duration-200 invisible"
						} transition-all`}
					>
						<ModalUser isOpen={showMenu} />
					</div>
					<div className="md:p-[2rem] bg-[#e3e3e3] min-h-[calc(100vh-4rem)]">
						<div className="h-[100%] w-[100%] bg-[#f8f8f8] rounded-lg p-[1rem]">
							{content}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

Template.propTypes = {
	content: PropTypes.node.isRequired,
	rol: PropTypes.string,
	title: PropTypes.string,
	propButton: PropTypes.string,
};

export default Template;

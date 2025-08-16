import {useNavigate} from "react-router-dom";

function ModalUser() {
	const navigate = useNavigate();
	function logout() {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("Course")) {
				localStorage.removeItem(key);
			}
		});
		navigate("/login");
	}

	return (
		<>
			<div
				id="modal-user"
				className="bg-[#000] bg-opacity-90 absolute right-4 rounded-xl border border-[#E5e5e5] p-[0.5rem] z-50"
			>
				<a
					className="hover:bg-[#2e2e2e] cursor-pointer rounded-xl p-[0.5rem] my-[1rem] flex items-center"
					href="/profile"
				>
					<span className="material-symbols-outlined mr-[0.3rem] text-[#fff]">
						{" "}
						person{" "}
					</span>
					<span className="text-modal text-[#fff]">My Profile</span>
				</a>
				<hr className="border-[#fff]" />
				<div
					className="hover:bg-[#d81e35] cursor-pointer rounded-xl p-[0.5rem] flex items-center mt-[0.5rem]"
					onClick={logout}
				>
					<span className="material-symbols-outlined mr-[0.3rem] text-[#fff]">
						{" "}
						logout{" "}
					</span>
					<span className="text-modal text-[#fff]">Logout</span>
				</div>
			</div>
		</>
	);
}

export default ModalUser;

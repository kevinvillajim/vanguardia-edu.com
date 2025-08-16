import PropTypes from "prop-types";
import {useState} from "react";
import ToggleSwitch from "../../../components/ui/ToggleSwitch/ToggleSwitch"; // Asegúrate de importar correctamente

export function ModalEdit({setShowModalEdit, user, handleEditUser}) {
	const [isActive, setIsActive] = useState(Number(user.active) === 1);

	const handleToggle = (newState) => {
		setIsActive(newState);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await handleEditUser(user.id, {active: isActive ? 1 : 0});
			setShowModalEdit(false);
		} catch (error) {
			console.error("Error updating user:", error);
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
			<div className="md:w-[30%] bg-white px-[2rem] py-[2rem] rounded-lg relative">
				<div className="w-[100%] text-end">
					<span
						className="material-symbols-outlined cursor-pointer"
						onClick={() => setShowModalEdit(false)}
					>
						close
					</span>
				</div>
				<div className="h-[100%] w-[100%] flex justify-center items-center">
					<form onSubmit={handleSubmit} className="w-[100%] px-[2rem]">
						<div className="my-[1rem] flex justify-between">
							<label htmlFor="active" className="mr-[1rem]">
								Activo
							</label>
							<ToggleSwitch checked={isActive} onChange={handleToggle} />
						</div>
						<input
							className="bg-[#017cfe] text-[#fff] rounded-md px-[1rem] py-[0.4rem] w-[100%] mt-[1rem] cursor-pointer text-[16px] animatedBgButtons"
							type="submit"
							value="Actualizar"
						/>
					</form>
				</div>
			</div>
		</div>
	);
}

ModalEdit.propTypes = {
	setShowModalEdit: PropTypes.func.isRequired,
	user: PropTypes.object.isRequired,
	handleEditUser: PropTypes.func.isRequired,
};

export default ModalEdit
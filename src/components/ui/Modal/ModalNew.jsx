import PropTypes from "prop-types";
import {useState} from "react";

export function ModalNew({setShowModalNew, formObject, handleCreateUser}) {
	const [formData, setFormData] = useState(
		formObject.reduce((acc, item) => {
			acc[item.name] = item.value || "";
			return acc;
		}, {})
	);

	const handleChange = (e) => {
		const {name, value} = e.target;
		setFormData({...formData, [name]: value});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await handleCreateUser(formData);
			setShowModalNew(false);
		} catch (error) {
			console.error("Error creating user:", error);
		}
	};

	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
				<div className="md:w-[30%] bg-white px-[2rem] py-[2rem] rounded-lg relative">
					<div className="w-[100%] text-end">
						<span
							className="material-symbols-outlined cursor-pointer"
							onClick={() => {
								setShowModalNew(false);
							}}
						>
							close
						</span>
					</div>
					<div className="h-[100%] w-[100%] flex justify-center items-center">
						<form onSubmit={handleSubmit} className="w-[100%] px-[2rem]">
							{formObject.map((item, index) => (
								<div key={index} className="mb-[1rem]">
									<label htmlFor={item.name} className="block mb-[0.5rem]">
										{item.label}
									</label>
									<input
										type={
											item.name === "password" ||
											item.name === "password_confirmation"
												? "password"
												: "text"
										}
										name={item.name}
										id={item.name}
										className={`bg-gray-100 text-[#fff] w-[100%] px-[1rem] py-[0.5rem] ${item.style}`}
										value={formData[item.name]}
										onChange={handleChange}
										required={item.name === "password" ? true : false}
									/>
								</div>
							))}
							<input
								className="bg-[#017cfe] text-[#fff] rounded-md px-[1rem] py-[0.4rem] w-[100%] mt-[1rem] text-[16px] cursor-pointer animatedBgButtons"
								type="submit"
								value="Crear"
							/>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}

ModalNew.propTypes = {
	setShowModalNew: PropTypes.func.isRequired,
	formObject: PropTypes.array.isRequired,
	api: PropTypes.string.isRequired,
	handleCreateUser: PropTypes.func.isRequired,
};

export default ModalNew;
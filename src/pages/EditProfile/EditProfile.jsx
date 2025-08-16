import api from "../../config/api";
import {useState, useEffect} from "react";
import ModalUser from "../../components/ui/Modal/ModalUser";
import {getFromLocalStorage, saveToLocalStorage} from "../../utils/crypto";

const ProfileEdit = () => {
	const user = JSON.parse(getFromLocalStorage("user"));
	const [userData, setUserData] = useState({
		name: user.name || "",
		bio: user.bio || "",
		phone: user.phone || "",
		email: user.email || "",
		password: "",
		photo: user.avatar || "",
	});

	useEffect(() => {
		setUserData({
			name: user.name || "",
			bio: user.bio || "",
			phone: user.phone || "",
			email: user.email || "",
			password: user.password || "",
			photo: user.avatar || "",
		});
	}, []);

	const handleChange = (e) => {
		const {name, value} = e.target;
		setUserData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handlePhotoChange = async (e) => {
		if (e.target.files && e.target.files[0]) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setUserData((prevData) => ({
					...prevData,
					photo: reader.result,
				}));
			};
			reader.readAsDataURL(e.target.files[0]);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const response = await api.post("/edit-profile", {
				...userData,
				photo: userData.photo,
			});

			saveToLocalStorage("user", JSON.stringify(response.data.user));
			setUserData(response.data.user);
			window.location.href = "/profile";
		} catch (error) {
			console.error("Error al actualizar el perfil:", error.response.data);
			// Manejar errores
		}
	};

	const [showMenu, setShowMenu] = useState(true);
	const [showModal, setShowModal] = useState(false);

	const handleMenuClick = () => {
		setShowMenu((prevShowMenu) => !prevShowMenu);
	};

	const handleModalClick = () => {
		setShowModal((prevShowModal) => !prevShowModal);
	};

	return (
		<div className="flex flex-col h-screen bg-gray-200 dark:bg-gray-800">
			<header
				className={`w-[100%] h-[5rem] flex justify-between items-center px-[2rem] shadow-sm my-[0.5rem]`}
			>
				<a href="/profile" className="animatedBig">
					<div
						id="menu-principal"
						className="flex cursor-pointer items-center"
						onClick={handleMenuClick}
					>
						<span className="material-symbols-outlined text-white">
							arrow_back_ios
						</span>
						<h2 className="ml-[1rem] text-white">Back</h2>
					</div>
				</a>
				<div
					className="flex cursor-pointer animatedBig"
					id="show-modal"
					onClick={handleModalClick}
				>
					<img
						src={user.avatar ? user.avatar : "/avatarDef.png"}
						alt={user.name + "avatar"}
						className="w-[2.5rem] h-[2.5rem] rounded-full object-cover"
					/>
					<div className="flex items-center">
						<h2 className="ml-[1rem] text-white">{user.name}</h2>
						<span id="more" className="material-symbols-outlined text-white">
							expand_more
						</span>
					</div>
					<div
						className={`${
							showModal
								? "w-[10rem] opacity-100 scale-100 duration-300"
								: "opacity-0 scale-y-90 duration-200 invisible"
						} transition-all`}
					>
						<ModalUser isOpen={showMenu} />
					</div>
				</div>
			</header>
			<div className="w-[100%] flex justify-center">
				<div className=" w-[98%] md:w-[35%] py-3">
					<div className="mb-2 md:mb-8 text-center">
						<h1 className="font-bold text-2xl md:text-3xl mb-2 text-gray-800 dark:text-gray-400">
							Cambiar Información
						</h1>
						<h3 className="text-sm text-gray-600 dark:text-gray-400">
							Los cambios se verán reflejados en toda la plataforma
						</h3>
					</div>
					<form
						className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 md:p-6"
						onSubmit={handleSubmit}
					>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								FOTO
							</label>
							<div className="flex items-center">
								<img
									src={userData.photo}
									alt="profile"
									className="rounded-md w-12 h-12 object-cover"
								/>
								<label
									htmlFor="upload-photo"
									className="ml-4 cursor-pointer text-blue-500 animatedBig"
								>
									Cambiar
								</label>
								<input
									id="upload-photo"
									type="file"
									accept="image/*"
									name="photo"
									onChange={handlePhotoChange}
									className="hidden"
								/>
							</div>
						</div>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								NOMBRE
							</label>
							<input
								type="text"
								name="name"
								value={userData.name}
								onChange={handleChange}
								placeholder="Enter your name..."
								className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								BIO
							</label>
							<input
								type="text"
								name="bio"
								value={userData.bio}
								onChange={handleChange}
								placeholder="Enter your bio..."
								className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								TELÉFONO
							</label>
							<input
								type="text"
								name="phone"
								value={userData.phone}
								onChange={handleChange}
								placeholder="Enter your phone..."
								className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								EMAIL
							</label>
							<input
								type="email"
								name="email"
								value={userData.email}
								onChange={handleChange}
								placeholder="Enter your email..."
								className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
						<div className="mb-3 md:mb-6">
							<label className="block text-gray-500 text-xs font-medium mb-1 dark:text-gray-400">
								PASSWORD
							</label>
							<input
								type="password"
								name="password"
								value={userData.password}
								onChange={handleChange}
								placeholder="Change your password..."
								className="w-full border border-gray-300 rounded-md p-2 dark:bg-gray-700 dark:text-gray-400"
							/>
						</div>
						<div className="flex justify-end">
							<button
								type="submit"
								className="bg-blue-500 text-white py-2 px-4 rounded-md animatedBgButtons"
							>
								Guardar
							</button>
						</div>
					</form>
					<div className="flex justify-between items-center mt-4">
						<div>
							<p className="text-gray-600 text-xs">created by</p>
							<a
								href="https://github.com/kevinvillajim"
								className="text-blue-500 text-xs font-medium"
								target="_blank"
								rel="noopener noreferrer"
							>
								kevinvillajim
							</a>
						</div>
						<div>
							<div className="text-xs dark:text-gray-600">Sinergy Hard ©</div>
							<div className="text-xs dark:text-gray-600">
								Esparta Agencia Creativa ©
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileEdit;

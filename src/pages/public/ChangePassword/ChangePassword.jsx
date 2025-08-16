import {useState} from "react";
import api from "../../../config/api";
import {useNavigate} from "react-router-dom";

export default function ChangePassword() {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleChangePassword = async (e) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}
		try {
			await api.post("/auth/change-password", {
				password: newPassword,
				confirmation: confirmPassword,
			});
			navigate("/estudiante/dashboard");
		} catch (error) {
			setError(
				error.response?.data?.message ||
					"Error desconocido al cambiar la contraseña"
			);
		}
	};

	return (
		<div className="flex flex-col flex-wrap items-center justify-center h-screen">
			<form onSubmit={handleChangePassword} className="md:w-[40rem] p-[2rem]">
				<h2 className="text-[1.5rem] mb-[1rem]">
					Bienvenido a la plataforma educativa de VanguardIA
				</h2>
				<h2 className="text-[1.2rem] mb-[1rem]">
					Por favor cambia tu contraseña de acceso.
				</h2>
				<input
					type="password"
					value={newPassword}
					onChange={(e) => setNewPassword(e.target.value)}
					placeholder="Nueva Contraseña"
					required
					className="mb-[1rem] w-full p-[0.5rem] border border-gray-300 rounded"
				/>
				<input
					type="password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					placeholder="Confirmar Contraseña"
					required
					className="mb-[1rem] w-full p-[0.5rem] border border-gray-300 rounded"
				/>
				{error && <p className="text-[12px] text-red-500">{error}</p>}
				<button
					type="submit"
					className="w-full p-[0.5rem] bg-[#006937] rounded-full text-white"
				>
					Cambiar Contraseña
				</button>
			</form>
		</div>
	);
}

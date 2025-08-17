// src/pages/admin/Users/ModernUsers.jsx
import {useState, useEffect, useCallback} from "react";
import {motion} from "motion/react";
import PropTypes from "prop-types";
import ModernTemplate from "../../../components/layout/ModernTemplate/ModernTemplate";
import Button from "../../../components/ui/Button/Button";
import Modal from "../../../components/ui/Modal/Modal";
import Input from "../../../components/ui/Input/Input";
import Table from "../../../components/ui/Table/Table";
import Breadcrumbs from "../../../components/ui/Navigation/Breadcrumbs";
import Tabs from "../../../components/ui/Navigation/Tabs";
import { useToast } from "../../../components/ui/Toast/Toast";
import api from "../../../config/api";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, label }) => {
	return (
		<div className="flex items-center justify-between">
			<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
				{label}
			</span>
			<button
				type="button"
				onClick={() => onChange(!checked)}
				className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
					checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
				}`}
			>
				<span
					className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
						checked ? 'translate-x-6' : 'translate-x-1'
					}`}
				/>
			</button>
		</div>
	);
};

ToggleSwitch.propTypes = {
	checked: PropTypes.bool.isRequired,
	onChange: PropTypes.func.isRequired,
	label: PropTypes.string.isRequired,
};

const ModernUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		ci: "",
		password: "",
		password_confirmation: "",
	});
	const [editFormData, setEditFormData] = useState({
		name: "",
		email: "",
		ci: "",
		active: 1,
	});
	const {toast} = useToast();

	const breadcrumbItems = [
		{label: "Dashboard", href: "/admin/dashboard"},
		{label: "Gestión de Usuarios"},
	];

	const fetchUsers = useCallback(async () => {
		try {
			setLoading(true);
			const response = await api.get("/users");
			setUsers(response.data);
		} catch (error) {
			console.error("Error fetching users:", error);
			toast.error("Error al cargar los usuarios");
		} finally {
			setLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	const handleCreateUser = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.password_confirmation) {
			toast.error("Las contraseñas no coinciden");
			return;
		}

		try {
			await api.post("/users", formData);
			toast.success("Usuario creado exitosamente");
			setShowCreateModal(false);
			setFormData({
				name: "",
				email: "",
				ci: "",
				password: "",
				password_confirmation: "",
			});
			fetchUsers();
		} catch (error) {
			console.error("Error creating user:", error);
			toast.error("Error al crear el usuario");
		}
	};

	const handleEditUser = async (e) => {
		e.preventDefault();

		try {
			await api.put(`/users/${selectedUser.id}`, editFormData);
			toast.success("Usuario actualizado exitosamente");
			setShowEditModal(false);
			fetchUsers();
		} catch (error) {
			console.error("Error updating user:", error);
			toast.error("Error al actualizar el usuario");
		}
	};

	const openEditModal = (user) => {
		setSelectedUser(user);
		setEditFormData({
			name: user.name || "",
			email: user.email || "",
			ci: user.ci || "",
			active: parseInt(user.active),
		});
		setShowEditModal(true);
	};

	const handleDeleteUser = async (userId) => {
		if (
			!window.confirm("¿Estás seguro de que quieres eliminar este usuario?")
		) {
			return;
		}

		try {
			await api.delete(`/users/${userId}`);
			toast.success("Usuario eliminado exitosamente");
			fetchUsers();
		} catch (error) {
			console.error("Error deleting user:", error);
			toast.error("Error al eliminar el usuario");
		}
	};

	const handleResetPassword = async (userId) => {
		try {
			const response = await api.put(`/users/${userId}/reset-password`);
			toast.success(response.data.message || "Contraseña restablecida");
		} catch (error) {
			console.error("Error resetting password:", error);
			toast.error("Error al restablecer la contraseña");
		}
	};

	const handleBulkDelete = async (selectedIds) => {
		if (
			!window.confirm(
				`¿Estás seguro de que quieres eliminar ${selectedIds.length} usuarios?`
			)
		) {
			return;
		}

		try {
			await Promise.all(selectedIds.map((id) => api.delete(`/users/${id}`)));
			toast.success(`${selectedIds.length} usuarios eliminados`);
			fetchUsers();
		} catch (error) {
			console.error("Error bulk deleting users:", error);
			toast.error("Error al eliminar los usuarios");
		}
	};

	const columns = [
		{
			key: "id",
			title: "ID",
			render: (value) => (
				<span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
					#{value}
				</span>
			),
		},
		{
			key: "name",
			title: "Nombre",
			render: (value, row) => (
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
						<span className="text-white font-medium text-sm">
							{value?.charAt(0)?.toUpperCase() || "U"}
						</span>
					</div>
					<div>
						<p className="font-medium text-gray-900 dark:text-white">{value}</p>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{row.email}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "ci",
			title: "Cédula",
			render: (value) => <span className="font-mono text-sm">{value}</span>,
		},
		{
			key: "role",
			title: "Rol",
			render: (value) => {
				const numericRole = parseInt(value);
				const roleConfig = {
					1: {
						label: "Administrador",
						color:
							"bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
					},
					2: {
						label: "Estudiante",
						color:
							"bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
					},
					3: {
						label: "Instructor",
						color:
							"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
					},
				};

				const config = roleConfig[numericRole] || {
					label: "Sin rol",
					color:
						"bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
				};

				return (
					<span
						className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
					>
						{config.label}
					</span>
				);
			},
		},
		{
			key: "active",
			title: "Estado",
			render: (value) => (
				<span
					className={`px-2 py-1 rounded-full text-xs font-medium ${
						parseInt(value) === 1
							? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
							: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
					}`}
				>
					{parseInt(value) === 1 ? "Activo" : "Inactivo"}
				</span>
			),
		},
		{
			key: "actions",
			title: "Acciones",
			sortable: false,
			render: (_, row) => {
				if (parseInt(row.role) === 1) return null; // No mostrar acciones para admin

				return (
					<div className="flex items-center space-x-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								openEditModal(row);
							}}
							leftIcon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							}
						>
							Editar
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								handleResetPassword(row.id);
							}}
							leftIcon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7 7h-3l-3-3h3a4 4 0 004-4z"
									/>
								</svg>
							}
						>
							Reset Password
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={(e) => {
								e.stopPropagation();
								handleDeleteUser(row.id);
							}}
							leftIcon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							}
							className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
						>
							Eliminar
						</Button>
					</div>
				);
			},
		},
	];

	const tableActions = [
		{
			label: "Eliminar seleccionados",
			onClick: handleBulkDelete,
			variant: "danger",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			),
		},
	];

	const tabs = [
		{
			label: "Todos los Usuarios",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
					/>
				</svg>
			),
			badge: users.length,
			content: (
				<Table
					data={users}
					columns={columns}
					loading={loading}
					searchable={true}
					sortable={true}
					selectable={true}
					actions={tableActions}
					onRowClick={(user) => {
						if (parseInt(user.role) !== 1) {
							openEditModal(user);
						}
					}}
				/>
			),
		},
		{
			label: "Administradores",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
					/>
				</svg>
			),
			badge: users.filter((u) => parseInt(u.role) === 1).length,
			content: (
				<Table
					data={users.filter((u) => parseInt(u.role) === 1)}
					columns={columns.filter((c) => c.key !== "actions")}
					loading={loading}
					searchable={true}
					sortable={true}
				/>
			),
		},
		{
			label: "Estudiantes",
			icon: (
				<svg
					className="w-4 h-4"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
					/>
				</svg>
			),
			badge: users.filter((u) => parseInt(u.role) === 2).length,
			content: (
				<Table
					data={users.filter((u) => parseInt(u.role) === 2)}
					columns={columns}
					loading={loading}
					searchable={true}
					sortable={true}
					selectable={true}
					actions={tableActions}
					onRowClick={(user) => {
						openEditModal(user);
					}}
				/>
			),
		},
	];

	return (
		<ModernTemplate rol="admin" title="Gestión de Usuarios">
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<Breadcrumbs items={breadcrumbItems} />
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
							Gestión de Usuarios
						</h1>
						<p className="text-gray-600 dark:text-gray-400 mt-1">
							Administra los usuarios de la plataforma
						</p>
					</div>

					<div className="flex items-center space-x-3">
						<Button
							variant="outline"
							onClick={() => toast.info("Funcionalidad de importación CSV próximamente")}
							leftIcon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
									/>
								</svg>
							}
						>
							Importar CSV
						</Button>
						<Button
							variant="primary"
							onClick={() => setShowCreateModal(true)}
							leftIcon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							}
						>
							Nuevo Usuario
						</Button>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					{[
						{label: "Total Usuarios", value: users.length, color: "blue"},
						{
							label: "Usuarios Activos",
							value: users.filter((u) => parseInt(u.active) === 1).length,
							color: "green",
						},
						{
							label: "Estudiantes",
							value: users.filter((u) => parseInt(u.role) === 2).length,
							color: "purple",
						},
						{
							label: "Administradores",
							value: users.filter((u) => parseInt(u.role) === 1).length,
							color: "orange",
						},
					].map((stat, index) => (
						<motion.div
							key={index}
							initial={{opacity: 0, y: 20}}
							animate={{opacity: 1, y: 0}}
							transition={{delay: index * 0.1}}
							className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{stat.label}
									</p>
									<p className="text-3xl font-bold text-gray-900 dark:text-white">
										{stat.value}
									</p>
								</div>
								<div
									className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center`}
								>
									<svg
										className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
										/>
									</svg>
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Tabs with Tables */}
				<Tabs tabs={tabs} variant="default" />

				{/* Create User Modal */}
				<Modal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					title="Crear Nuevo Usuario"
					size="md"
				>
					<form onSubmit={handleCreateUser} className="space-y-4">
						<Input
							label="Nombre completo"
							value={formData.name}
							onChange={(e) => setFormData({...formData, name: e.target.value})}
							required
						/>
						<Input
							type="email"
							label="Correo electrónico"
							value={formData.email}
							onChange={(e) =>
								setFormData({...formData, email: e.target.value})
							}
							required
						/>
						<Input
							label="Cédula"
							value={formData.ci}
							onChange={(e) => setFormData({...formData, ci: e.target.value})}
							required
						/>
						<Input
							type="password"
							label="Contraseña"
							value={formData.password}
							onChange={(e) =>
								setFormData({...formData, password: e.target.value})
							}
							required
						/>
						<Input
							type="password"
							label="Confirmar contraseña"
							value={formData.password_confirmation}
							onChange={(e) =>
								setFormData({
									...formData,
									password_confirmation: e.target.value,
								})
							}
							required
						/>
						<div className="flex space-x-3 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowCreateModal(false)}
								fullWidth
							>
								Cancelar
							</Button>
							<Button type="submit" variant="primary" fullWidth>
								Crear Usuario
							</Button>
						</div>
					</form>
				</Modal>

				{/* Edit User Modal */}
				<Modal
					isOpen={showEditModal}
					onClose={() => setShowEditModal(false)}
					title={`Editar Usuario - ${selectedUser?.name}`}
					size="md"
				>
					{selectedUser && (
						<form onSubmit={handleEditUser} className="space-y-4">
							{/* User Avatar/Icon */}
							<div className="flex items-center justify-center mb-6">
								<div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white font-bold text-2xl">
										{selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
									</span>
								</div>
							</div>

							<Input
								label="Nombre completo"
								value={editFormData.name}
								onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
								required
							/>
							
							<Input
								type="email"
								label="Correo electrónico"
								value={editFormData.email}
								onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
								required
							/>
							
							<Input
								label="Cédula"
								value={editFormData.ci}
								onChange={(e) => setEditFormData({...editFormData, ci: e.target.value})}
								required
							/>

							{/* Estado del Usuario */}
							<div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
								<ToggleSwitch
									checked={editFormData.active === 1}
									onChange={(checked) => setEditFormData({...editFormData, active: checked ? 1 : 0})}
									label={`Estado: ${editFormData.active === 1 ? 'Activo' : 'Inactivo'}`}
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
									{editFormData.active === 1 
										? "El usuario puede acceder a la plataforma" 
										: "El usuario no puede acceder a la plataforma"
									}
								</p>
							</div>

							{/* User Info Card */}
							<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
								<h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
									Información del Usuario
								</h4>
								<div className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
									<p><strong>ID:</strong> #{selectedUser.id}</p>
									<p><strong>Rol:</strong> {
										parseInt(selectedUser.role) === 1 ? "Administrador" : 
										parseInt(selectedUser.role) === 2 ? "Estudiante" : "Instructor"
									}</p>
									<p><strong>Teléfono:</strong> {selectedUser.phone || "No registrado"}</p>
								</div>
							</div>

							<div className="flex space-x-3 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowEditModal(false)}
									fullWidth
								>
									Cancelar
								</Button>
								<Button type="submit" variant="primary" fullWidth>
									Guardar Cambios
								</Button>
							</div>
						</form>
					)}
				</Modal>
			</div>
		</ModernTemplate>
	);
};

export default ModernUsers;
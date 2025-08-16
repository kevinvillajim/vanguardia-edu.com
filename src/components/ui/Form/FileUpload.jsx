// src/components/ui/Form/FileUpload.jsx
import {useState, useCallback} from "react";
import {motion, AnimatePresence} from "framer-motion";
import PropTypes from "prop-types";

const FileUpload = ({
	accept,
	multiple = false,
	maxSize = 5 * 1024 * 1024, // 5MB
	onFileSelect,
	placeholder = "Arrastra archivos aquí o haz clic para seleccionar",
	className = "",
}) => {
	const [dragActive, setDragActive] = useState(false);
	const [files, setFiles] = useState([]);
	const [errors, setErrors] = useState([]);

	const validateFile = (file) => {
		const errors = [];

		if (maxSize && file.size > maxSize) {
			errors.push(
				`El archivo ${file.name} excede el tamaño máximo de ${Math.round(
					maxSize / 1024 / 1024
				)}MB`
			);
		}

		if (accept) {
			const acceptedTypes = accept.split(",").map((type) => type.trim());
			const fileType = file.type;
			const fileName = file.name.toLowerCase();

			const isValidType = acceptedTypes.some((type) => {
				if (type.startsWith(".")) {
					return fileName.endsWith(type);
				}
				return fileType.match(type.replace("*", ".*"));
			});

			if (!isValidType) {
				errors.push(`El archivo ${file.name} no es un tipo válido`);
			}
		}

		return errors;
	};

	const handleFiles = useCallback(
		(fileList) => {
			const newFiles = Array.from(fileList);
			const validFiles = [];
			const newErrors = [];

			newFiles.forEach((file) => {
				const fileErrors = validateFile(file);
				if (fileErrors.length === 0) {
					validFiles.push(file);
				} else {
					newErrors.push(...fileErrors);
				}
			});

			if (multiple) {
				setFiles((prev) => [...prev, ...validFiles]);
			} else {
				setFiles(validFiles.slice(0, 1));
			}

			setErrors(newErrors);
			onFileSelect(multiple ? [...files, ...validFiles] : validFiles[0]);
		},
		[files, multiple, onFileSelect]
	);

	const handleDrag = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback(
		(e) => {
			e.preventDefault();
			e.stopPropagation();
			setDragActive(false);

			if (e.dataTransfer.files && e.dataTransfer.files[0]) {
				handleFiles(e.dataTransfer.files);
			}
		},
		[handleFiles]
	);

	const handleChange = (e) => {
		e.preventDefault();
		if (e.target.files && e.target.files[0]) {
			handleFiles(e.target.files);
		}
	};

	const removeFile = (index) => {
		const newFiles = files.filter((_, i) => i !== index);
		setFiles(newFiles);
		onFileSelect(multiple ? newFiles : null);
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	return (
		<div className={className}>
			<div
				className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${
						dragActive
							? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
							: "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
					}
        `}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
			>
				<input
					type="file"
					accept={accept}
					multiple={multiple}
					onChange={handleChange}
					className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
				/>

				<div className="space-y-4">
					<div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
							/>
						</svg>
					</div>

					<div>
						<p className="text-gray-700 dark:text-gray-300 font-medium">
							{placeholder}
						</p>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
							{accept && `Tipos permitidos: ${accept}`}
							{maxSize &&
								` • Tamaño máximo: ${Math.round(maxSize / 1024 / 1024)}MB`}
						</p>
					</div>
				</div>
			</div>

			{/* File List */}
			<AnimatePresence>
				{files.length > 0 && (
					<motion.div
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -10}}
						className="mt-4 space-y-2"
					>
						{files.map((file, index) => (
							<motion.div
								key={index}
								initial={{opacity: 0, x: -10}}
								animate={{opacity: 1, x: 0}}
								exit={{opacity: 0, x: 10}}
								className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
							>
								<div className="flex items-center space-x-3">
									<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
										<svg
											className="w-4 h-4 text-blue-600 dark:text-blue-400"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-sm font-medium text-gray-900 dark:text-white">
											{file.name}
										</p>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											{formatFileSize(file.size)}
										</p>
									</div>
								</div>

								<button
									onClick={() => removeFile(index)}
									className="p-1 text-gray-400 hover:text-red-500 transition-colors"
								>
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
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			{/* Errors */}
			<AnimatePresence>
				{errors.length > 0 && (
					<motion.div
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: -10}}
						className="mt-4 space-y-1"
					>
						{errors.map((error, index) => (
							<p key={index} className="text-sm text-red-600 dark:text-red-400">
								{error}
							</p>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

FileUpload.propTypes = {
	accept: PropTypes.string,
	multiple: PropTypes.bool,
	maxSize: PropTypes.number,
	onFileSelect: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	className: PropTypes.string,
};

export default FileUpload;

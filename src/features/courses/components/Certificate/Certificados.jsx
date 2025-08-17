import {PDFDownloadLink, PDFViewer} from "@react-pdf/renderer";
import CertificatePDF from "./CertificatePDF";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import api from "../../../../config/api";
import {useState, useEffect} from "react";

export default function Certificados({
	userId,
	courseId,
	name,
	ci,
	course,
	description,
	date,
	calification,
}) {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const updateCertificate = async (userId, courseId) => {
		try {
			const response = await api.post("/progress/update-certificate", {
				user_id: userId,
				course_id: courseId,
				certificate: 1,
			});
			console.log(response.data);
		} catch (error) {
			console.error("Error Updating Certificate:", error);
		}
	};

	const handleCertificateDownload = async (userId, courseId) => {
		await updateCertificate(userId, courseId);
	};

	return (
		<>
			<div className="md:hidden">Descargar certificado:</div>
			<div className="md:px-[4rem] text-center md:text-left">
				<PDFDownloadLink
					document={
						<CertificatePDF
							name={name}
							ci={ci}
							course={course}
							description={description}
							dateFinal={date}
							calification={calification}
						/>
					}
					fileName="CerificadoCurso1.pdf"
				>
					{({
						loading,
						// , blob, url, error
					}) =>
						loading ? (
							<img src="/loading.gif" className="w-[20px] " />
						) : (
							<IconButton
								onClick={() => {
									handleCertificateDownload(userId, courseId);
								}}
								aria-label="fingerprint"
								color="primary"
							>
								<DownloadIcon />
							</IconButton>
						)
					}
				</PDFDownloadLink>
				<div className="md:hidden text-[12px]">
					Vista Previa no disponible, abrir desde una computadora.
				</div>
				<div className="hidden md:inline">
					{isClient ? (
						<PDFViewer
							showToolbar={false}
							style={{width: "100%", height: "650px"}}
						>
							<CertificatePDF
								name={name}
								ci={ci}
								course={course}
								description={description}
								dateFinal={date}
								calification={calification}
							/>
						</PDFViewer>
					) : (
						<div 
							style={{width: "100%", height: "650px", border: "1px solid #ccc"}}
							className="flex items-center justify-center bg-gray-100"
						>
							<div className="text-center">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
								<p className="text-gray-600">Cargando vista previa del certificado...</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

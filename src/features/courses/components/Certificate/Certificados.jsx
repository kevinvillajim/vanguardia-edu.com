import {PDFDownloadLink, PDFViewer} from "@react-pdf/renderer";
import CertificatePDF from "./CertificatePDF";
import DownloadIcon from "@mui/icons-material/Download";
import IconButton from "@mui/material/IconButton";
import api from "../../../../config/api";

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
							handleCertificateDownload={handleCertificateDownload}
						/>
					</PDFViewer>
				</div>
			</div>
		</>
	);
}

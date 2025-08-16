import PropTypes from "prop-types";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		flexDirection: "row",
		backgroundColor: "#fff",
		display: "flex",
		justifyContent: "center",
		padding: 20,
	},
	section: {
		margin: 10,
		padding: 10,
		flexGrow: 1,
		flexDirection: "row",
	},
	logo: {
		width: 150,
	},
	colorShape: {
		width: 30,
		height: 500,
		backgroundColor: "green",
		borderRadius: 5,
	},
	totalContainer: {
		paddingHorizontal: 50,
		paddingVertical: 30,
	},
	header: {
		flexDirection: "row",
		gap: 300,
		alignItems: "center",
	},
	courseContainer: {
		backgroundColor: "#F7FFF4",
		padding: 18,
		border: 1,
		borderColor: "#E4E4E4",
		borderRadius: 5,
		borderLeftColor: "#fff",
		borderLeft: 5,
		marginVertical: 15,
	},
	CourseContent: {gap: 10},
	big: {
		fontSize: 50,
		fontWeight: 800,
	},
	midBig: {
		fontSize: 30,
		fontWeight: 700,
	},
	mid: {
		fontSize: 20,
		fontWeight: 500,
	},
	small: {
		fontSize: 12,
		fontWeight: 200,
		width: 500,
	},
	xsmall: {
		fontSize: 16,
		fontWeight: 200,
	},
	gap: {
		gap: 5,
		marginTop: 15,
	},
	liston: {
		width: 120,
		height: "auto",
		position: "absolute",
		bottom: 60,
		right: 35,
	},
	course: {
		fontSize: 30,
		fontWeight: 700,
		width: 450,
	},
});

function CertificatePDF({
	name,
	ci,
	course,
	description,
	dateFinal,
	calification,
}) {
	return (
		<Document>
			<Page size="A4" orientation="landscape" style={styles.page}>
				<View style={styles.section}>
					<View style={styles.colorShape}></View>
					<View style={styles.totalContainer}>
						<View style={styles.header}>
							<View style={styles.gap}>
								<Text style={styles.midBig}>CERTIFICADO</Text>
								<Text style={styles.mid}>
									El presente documento se entrega a:
								</Text>
							</View>
							<View>
								<Image style={styles.logo} src="/logo.png" />
							</View>
						</View>
						<View>
							<View style={styles.gap}>
								<Text style={styles.big}>{name}</Text>
								<Text style={styles.small}>
									Con número de cédula Ecuatoriana: {ci}
								</Text>
								<Text style={styles.mid}>
									Por completar con éxito el curso:
								</Text>
							</View>
							<View style={styles.courseContainer}>
								<View style={styles.courseShape}></View>
								<View style={styles.CourseContent}>
									<Text style={styles.course}>{course}</Text>
									<Text style={styles.small}>{description}</Text>
								</View>
							</View>
							<View style={styles.gap}>
								<Text style={styles.xsmall}>
									Fecha de Finalización: {dateFinal}
								</Text>
								<Text style={styles.xsmall}>
									Con una calificación de: {calification} / 100
								</Text>
							</View>
						</View>
					</View>
					<Image style={styles.liston} src="/liston.png"></Image>
				</View>
			</Page>
		</Document>
	);
}

CertificatePDF.propTypes = {
	name: PropTypes.string,
	ci: PropTypes.string,
	course: PropTypes.string,
	description: PropTypes.string,
	dateFinal: PropTypes.string,
	calification: PropTypes.number,
};

export default CertificatePDF;

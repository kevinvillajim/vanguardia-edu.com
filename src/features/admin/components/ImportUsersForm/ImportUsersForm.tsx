import {useState} from "react";
import api from "../../../../config/api";

function ImportUsersForm({setShowModalFile}) {
	const [file, setFile] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleFileChange = (event) => {
		setFile(event.target.files[0]);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!file) {
			alert("Please select a file first!");
			return;
		}

		const formData = new FormData();
		formData.append("file", file);

		setLoading(true);

		try {
			const response = await api.post("/import-users", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			console.log("File uploaded successfully:", response.data);
			setShowModalFile(false);
			window.location.reload();
		} catch (error) {
			console.error(
				"Error uploading file:",
				error.response?.data || error.message
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} encType="multipart/form-data">
			<input
				type="file"
				name="file"
				accept=".csv"
				onChange={handleFileChange}
				className="mb-[2rem]"
			/>
			<button
				type="submit"
				disabled={loading}
				className="bg-[#017cfe] text-[#fff] py-[0.3rem] px-[0.6rem] rounded-md animatedBgButtons w-full"
			>
				{loading ? "Uploading..." : "Upload"}
			</button>
		</form>
	);
}

export default ImportUsersForm;

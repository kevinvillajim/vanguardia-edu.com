import PropTypes from "prop-types";
import ImportUsersForm from "../../../features/admin/components/ImportUsersForm/ImportUsersForm";

export default function ModalFile({setShowModalFile}) {
	return (
		<>
			<div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
				<div className="md:w-[30%] bg-white px-[2rem] py-[2rem] rounded-lg relative">
					<div className="w-[100%] text-end">
						<span
							className="material-symbols-outlined cursor-pointer"
							onClick={() => {
								setShowModalFile(false);
							}}
						>
							close
						</span>
					</div>
					<div className="h-[100%] w-[100%] flex justify-center items-center">
						<ImportUsersForm setShowModalFile={setShowModalFile} />
					</div>
				</div>
			</div>
		</>
	);
}

ModalFile.propTypes = {
	setShowModalFile: PropTypes.func.isRequired,
};

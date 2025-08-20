export default function ContentCourse({
	subtitle,
	content,
	showModal,
	setShowModal,
}) {
	return (
		<>
			<div>
				<div className="p-[1rem] w-[100%] flex gap-3 bg-[#4a4a4a] text-white items-center">
					<span
						className="material-symbols-outlined cursor-pointer p-[0.3rem] rounded-lg animatedBg3"
						onClick={() => setShowModal(!showModal)}
					>
						{showModal ? "menu_open" : "menu"}
					</span>
					<span>{subtitle} - Curso Online</span>
				</div>
				<div className="p-[1rem]">{content}</div>
			</div>
		</>
	);
}

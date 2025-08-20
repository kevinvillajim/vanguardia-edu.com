export default function Material({title, archivo, img, descripcion}) {
	return (
		<>
			<div className="bg-[gray] py-[1rem] px-[1.5rem] w-[100%] flex justify-between items-center border-[#ADADAD] border-b-2">
				<div className="text-white flex flex-row items-center gap-3">
					<div className="w-[50px] h-[50px] rounded-full overflow-hidden">
						<img src={img} alt="file" className="w-full h-full object-cover" />
					</div>
					<div className="w-[76%]">
						<p className="text-md font-bold">{title}</p>
						<p className="text-sm">{descripcion}</p>
					</div>
				</div>
				<div>
					<a href={archivo} download>
						<span className="material-symbols-outlined text-[#6abf4c] cursor-pointer animatedBig">
							download
						</span>
					</a>
				</div>
			</div>
		</>
	);
}

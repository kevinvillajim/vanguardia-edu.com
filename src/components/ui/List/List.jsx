export default function List({li}) {
	return (
		<div className="w-full flex px-[2rem] py-[2rem]">
			<ul className="font-righteous text-white font-ligth text-md text-left list-disc">
				{li.map((item, index) => (
					<li className="ml-[3rem] mb-[0.7rem]" key={index}>
						{item}
					</li>
				))}
			</ul>
		</div>
	);
}

import {useState} from "react";

const Tabs = ({tabs}) => {
	const [activeTab, setActiveTab] = useState("tab1");

	const handleTabClick = (id) => {
		setActiveTab(id);
	};

	return (
		<div className="flex justify-center my-[3rem]">
			<div className="p-4 w-full max-w-4xl min-w-sm flex bg-gray-300 rounded-lg shadow-lg items-center md:flex-row flex-col">
				<ul className="flex flex-col border-b md:border-r border-gray-200 pr-4 gap-5">
					{tabs.map((tab) => (
						<li key={tab.id}>
							<button
								onClick={() => handleTabClick(tab.id)}
								className={`w-[100%] flex items-center gap-2 p-3 rounded-lg font-semibold ${
									activeTab === tab.id
										? "bg-gray-800 text-white"
										: "text-gray-500 hover:bg-gray-200"
								}`}
							>
								<span className="material-symbols-outlined">{tab.icon}</span>
								{tab.title}
							</button>
						</li>
					))}
				</ul>
				<div className="pl-4 w-full md:h-[33rem] overflow-hidden flex items-center">
					{tabs.map((tab) => (
						<div
							key={tab.id}
							className={`transition-opacity duration-300 my-[1rem] ${
								activeTab === tab.id ? "opacity-100" : "opacity-0 absolute"
							} ${activeTab === tab.id ? "block" : "hidden"}`}
						>
							<h2 className="text-xl font-bold text-gray-800 mb-2">
								{tab.title}
							</h2>
							<div className="text-gray-600">
								{tab.content.split("\n").map((line, index) => (
									<p className="mb-2" key={index}>
										{line}
									</p>
								))}
							</div>
							<div className="flex justify-center">
								<div className="h-[18rem] overflow-hidden items-center">
									<img
										src={tab.image}
										alt={tab.title}
										className="mt-4 object-fit"
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Tabs;

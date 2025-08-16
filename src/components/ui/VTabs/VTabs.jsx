import {useState, useEffect} from "react";

const tabData = [
	{
		id: "tab1",
		title: "Ingeniería Social",
		icon: "group",
		content: {
			heading: "Ingeniería Social",
			text: "Es una técnica de manipulación psicológica utilizada para engañar a individuos y hacer que divulguen información confidencial o realicen acciones que comprometan la seguridad. Es mas facil vulnerar a personas que a la tecnología",
			image: "ingsocial.webp",
		},
	},
	{
		id: "tab2",
		title: "Malware",
		icon: "coronavirus",
		content: {
			heading: "Malware",
			text: "Software malicioso diseñado para dañar, explotar, o comprometer sistemas informáticos sin el conocimiento o consentimiento del usuario.\n Los Backdoors uno de los mas peligrosos malewares deja un acceso abierto por donde ciberdelincuentes pueden aparte de robar toda tu información, manejan tu máquina remótamente.",
			image: "malware.jpg",
		},
	},
];

const VerticalTabs = () => {
	const [activeTab, setActiveTab] = useState(tabData[0].id);

	const handleTabClick = (id) => {
		setActiveTab(id);
	};

	const getActiveTabContent = () => {
		return tabData.find((tab) => tab.id === activeTab).content;
	};

	useEffect(() => {
		const currentHash = window.location.hash.replace("#", "");
		if (currentHash) {
			setActiveTab(currentHash);
		}
	}, []);

	return (
		<div className="flex w-full max-w-5xl mx-auto my-10 bg-white rounded-lg shadow-lg overflow-hidden">
			<ul className="flex flex-col w-1/3 border-r border-gray-200">
				{tabData.map((tab) => (
					<li key={tab.id} className="flex">
						<a
							href={`#${tab.id}`}
							id={tab.id}
							title={tab.title}
							className={`flex items-center px-6 py-4 text-lg font-semibold text-gray-600 hover:text-primary hover:border-primary ${
								activeTab === tab.id
									? "text-primary border-r-4 border-primary"
									: ""
							}`}
							onClick={() => handleTabClick(tab.id)}
						>
							<span className="material-symbols-outlined">{tab.icon}</span>
							<span className="ml-3">{tab.title}</span>
						</a>
					</li>
				))}
			</ul>
			<div className="flex-grow p-6">
				<section>
					<h2 className="text-2xl font-semibold text-gray-800 mb-4">
						{getActiveTabContent().heading}
					</h2>
					<p className="text-gray-600 mb-4">{getActiveTabContent().text}</p>
					<img
						src={getActiveTabContent().image}
						alt={getActiveTabContent().heading}
						className="w-3/4"
					/>
				</section>
			</div>
		</div>
	);
};

export default VerticalTabs;

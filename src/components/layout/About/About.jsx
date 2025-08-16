function About() {
	return (
		<>
			<div className="flex">
				<div className="flex w-[100%] bg-gradient-to-br from-black to-gray-400 px-[5rem] items-center about-container">
					<div className="w-[2000px] about-img">
						<img src="team.jpeg"></img>
					</div>
					<div className=" p-[5rem] flex flex-col gap-3 about-text-container">
						<h1 className="text-[3rem] text-white about-title">BLAGET</h1>
						<div>
							<p className="text-white about-text">
								Somos un equipo de empresarios especializados en el arbitraje
								deportivo, nos centramos en ofertar cursos que permiten a los
								participantes generar ingresos por un metodo inteligente,
								sofisticado y simple, Nuestro objetivo como equipo es permitirte
								dar un paso importante en tu independencia fincanciera.
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default About;

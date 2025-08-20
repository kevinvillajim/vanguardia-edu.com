import CarrouselTestimonies from "../../../components/ui/Carousel/CarouselTestimonies";

const carruselTestimonies = [
	{
		title: "Marco Ghandy",
		img: "testimonio1.png",
	},
	{
		title: "Elvis Cevallos",
		img: "testimonio2.png",
	},
	{
		title: "Jose Lapo",
		img: "testimonio3.png",
	},
	{
		title: "Mike Cedeño",
		img: "testimonio4.png",
	},
	{
		title: "Luis Cadenas",
		img: "testimonio5.png",
	},
	{
		title: "Andrés Blas",
		img: "testimonio6.png",
	},
];

function Testimonios() {
	return (
		<>
			<div className="flex justify-center items-center h-[70%]">
				<div className="p-[5rem] testimonios-container">
					{/* <h1 className="text-[30px]">Testimonios</h1> */}
					<div className="flex justify-center">
						<CarrouselTestimonies
							photos={carruselTestimonies}
							currentPhotoIndex={0}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

export default Testimonios;

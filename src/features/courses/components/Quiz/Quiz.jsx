/* eslint-disable react/prop-types */
import {useState} from "react";
import {
	Button,
	FormControl,
	FormControlLabel,
	Radio,
	RadioGroup,
	Typography,
	Box,
	CssBaseline,
	ThemeProvider,
	createTheme,
	Modal,
} from "@mui/material";

import cursos from "../../../../utils/cursos.js";
import ConfettiComponent from "../../../../components/ui/Confetti/Confetti.jsx";
import api from "../../../../config/api.js";
import {getFromLocalStorage} from "../../../../utils/crypto.js";

const theme = createTheme({
	palette: {
		mode: "dark",
		text: {
			primary: "#ffffff",
		},
		primary: {
			main: "#00ff00", // Color verde para botones y radios
		},
	},
});

const style = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
};

const Quiz = ({questions, unit, course}) => {
	const initialAnswers = questions.map(() => null);
	const [answers, setAnswers] = useState(initialAnswers);
	const [score, setScore] = useState(null);
	const [open, setOpen] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleAnswerChange = (questionIndex, optionIndex) => {
		setAnswers({...answers, [questionIndex]: optionIndex});
	};

	function formatDate(date) {
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses empiezan desde 0
		const year = date.getFullYear();
		return `${year}-${month}-${day}`;
	}

	const userId = JSON.parse(getFromLocalStorage("user")).id;

	const handleSubmit = async () => {
		let score = 0;
		questions.forEach((question, index) => {
			if (answers[index] === question.answer - 1) {
				score += 1;
			}
		});

		const scorePercentage = (score / questions.length) * 100;
		setScore(scorePercentage);

		if (scorePercentage >= 70) {
			localStorage.setItem(`Course${course}Quiz${unit}`, "true");

			const formattedDate = formatDate(new Date());
			localStorage.setItem(`Course${course}finishedDate`, formattedDate);
			setShowConfetti(true);
			await saveProgress(100, true, formattedDate, scorePercentage);
		} else {
			await saveProgress(95, false, null, scorePercentage);
		}
	};

	const saveProgress = async (progress, completed, finishDate, score) => {
		try {
			const data = {
				user_id: userId,
				course_id: course,
				unit_id: unit,
				progress: progress / 100,
				completed: completed,
				finishDate: finishDate,
				score: score,
				attempted: 1,
			};
			console.log("Data sent to API:", data);
			await api.post("/progress/upsert", data);
		} catch (error) {
			console.error("Error saving progress:", error);
		}
	};

	const getNextLink = () => {
		if (unit === cursos[course].units.length) {
			return "/estudiante/dashboard";
		} else {
			return cursos[course].units[unit]?.url || "/";
		}
	};

	const handleComplete = (unit) => {
		localStorage.setItem(`Course${course}Unidad${unit}`, "100");
	};

	return (
		<div className="md:my-[5rem] bg-gray-800 md:px-[5rem]">
			{showConfetti && <ConfettiComponent />}
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Box p={4} sx={{color: "white"}}>
					<Typography variant="h4" gutterBottom>
						Cuestionario sobre {cursos[course].title}
					</Typography>
					{questions.map((question, index) => (
						<Box key={index} mb={4}>
							<Typography variant="h6">{question.question}</Typography>
							<FormControl component="fieldset">
								<RadioGroup
									name={`question-${index}`}
									value={answers[index]}
									onChange={(e) =>
										handleAnswerChange(index, parseInt(e.target.value))
									}
								>
									{question.options.map((option, optionIndex) => (
										<div
											key={optionIndex}
											className="my-[0.5rem] md:my-[0.1rem]"
										>
											<FormControlLabel
												value={optionIndex}
												control={<Radio sx={{color: "white"}} />}
												label={
													<Typography sx={{color: "white"}}>
														{option}
													</Typography>
												}
											/>
										</div>
									))}
								</RadioGroup>
							</FormControl>
						</Box>
					))}
					<Button
						variant="contained"
						color="primary"
						onClick={() => {
							handleSubmit();
							handleOpen();
						}}
					>
						Enviar
					</Button>
					{score !== null && score >= 70 && (
						<Modal
							open={open}
							onClose={handleClose}
							aria-labelledby="modal-modal-title"
							aria-describedby="modal-modal-description"
						>
							<Box sx={style}>
								<Typography id="modal-modal-title" variant="h6" component="h2">
									Felicidades tu puntuación es: {score.toFixed(2)} / 100
									{unit === cursos[course].units.length &&
										localStorage.getItem("isFinished") === "true" && (
											<>{" Has completado el curso con éxito"}</>
										)}
								</Typography>
								<div className="flex justify-center mt-[2rem]">
									<Button
										variant="contained"
										color="primary"
										onClick={() => {
											handleComplete(unit);
											handleSubmit();
											setShowConfetti(false);
										}}
										href={getNextLink()}
									>
										{unit == cursos[course].units.length
											? "Regresar al Dashboard"
											: "Continuar"}
									</Button>
								</div>
							</Box>
						</Modal>
					)}
					{score !== null && (
						<Typography variant="h6" mt={4}>
							Tu puntuación: {score.toFixed(2)} / 100
						</Typography>
					)}
				</Box>
			</ThemeProvider>
		</div>
	);
};

export default Quiz;

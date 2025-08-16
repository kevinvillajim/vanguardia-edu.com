import {useEffect, useState, useCallback} from "react";
import api from "../../../../config/api";
import debounce from "lodash.debounce";
import {getFromLocalStorage} from "../../../../utils/crypto";

const ScrollProgress = ({scrollContainerRef, unit, course}) => {
	const [completion, setCompletion] = useState(0);
	const [top, setTop] = useState(() => {
		const savedTop = localStorage.getItem(`Course${course}Unidad${unit}`);
		return savedTop ? parseInt(savedTop, 10) : 0;
	});

	const isQuizCompleted = useCallback(() => {
		return localStorage.getItem(`Course${course}Quiz${unit}`) === "true";
	}, [course, unit]);

	const userId = JSON.parse(getFromLocalStorage("user")).id;

	const saveProgress = useCallback(
		async (progress) => {
			try {
				await api.post("/progress/upsert", {
					user_id: userId,
					course_id: course,
					unit_id: unit,
					progress: progress / 100,
					completed: isQuizCompleted(),
				});
			} catch (error) {
				console.error("Error saving progress:", error);
			}
		},
		[course, unit, isQuizCompleted, userId]
	);

	const debouncedSaveProgress = useCallback(debounce(saveProgress, 2000), [
		saveProgress,
	]);

	useEffect(() => {
		const updateScrollCompletion = () => {
			if (scrollContainerRef.current) {
				const scrollTop = scrollContainerRef.current.scrollTop;
				const scrollHeight =
					scrollContainerRef.current.scrollHeight -
					scrollContainerRef.current.clientHeight;
				let totalScroll = (scrollTop / scrollHeight) * 100;

				if (isQuizCompleted()) {
					totalScroll = 100;
				} else if (totalScroll >= 95) {
					totalScroll = 95;
				}

				setCompletion((prevCompletion) => {
					if (totalScroll !== prevCompletion) {
						return totalScroll;
					}
					return prevCompletion;
				});

				if (totalScroll > top) {
					setTop(totalScroll);
					localStorage.setItem(
						`Course${course}Unidad${unit}`,
						Math.floor(totalScroll).toString()
					);

					// Guarda el progreso solo si pasa uno de los puntos de interés
					if ([25, 50, 75, 95].includes(Math.floor(totalScroll))) {
						debouncedSaveProgress(totalScroll);
					}
				}
			}
		};

		const handleScroll = () => {
			requestAnimationFrame(updateScrollCompletion);
		};

		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (container) {
				container.removeEventListener("scroll", handleScroll);
			}
		};
	}, [
		scrollContainerRef,
		top,
		unit,
		course,
		isQuizCompleted,
		debouncedSaveProgress,
	]);

	useEffect(() => {
		if (
			isQuizCompleted() &&
			top < 100 &&
			parseInt(localStorage.getItem(`Course${course}Unidad${unit}`), 10) >= 95
		) {
			setTop(100);
			localStorage.setItem(`Course${course}Unidad${unit}`, "100");
			debouncedSaveProgress(100);
		}
	}, [completion, isQuizCompleted, top, course, unit, debouncedSaveProgress]);

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: `${completion}%`,
				height: "5px",
				backgroundColor: "green",
			}}
		/>
	);
};

export default ScrollProgress;

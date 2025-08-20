import {useEffect, useRef, useContext, createContext, useState} from "react";

// Create a context to share state between all videos
const VideoContext = createContext();

const VideoProvider = ({children}) => {
	const players = useRef(new Set());

	const registerPlayer = (player) => {
		players.current.add(player);
	};

	const unregisterPlayer = (player) => {
		players.current.delete(player);
	};

	const pauseOthers = (currentPlayer) => {
		players.current.forEach((player) => {
			if (player !== currentPlayer && !player.paused) {
				player.pause();
			}
		});
	};

	return (
		<VideoContext.Provider
			value={{registerPlayer, unregisterPlayer, pauseOthers}}
		>
			{children}
		</VideoContext.Provider>
	);
};

const Video = ({src, poster, title}) => {
	const playerRef = useRef(null);
	const {registerPlayer, unregisterPlayer, pauseOthers} =
		useContext(VideoContext);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const player = playerRef.current;
		if (player) {
			const handlePlay = () => pauseOthers(player);
			player.addEventListener("play", handlePlay);
			registerPlayer(player);

			return () => {
				player.removeEventListener("play", handlePlay);
				unregisterPlayer(player); // Remove the player from the context when it's unmounted
			};
		}
	}, [registerPlayer, unregisterPlayer, pauseOthers]);

	const handleVideoClick = () => {
		if (playerRef.current && !isLoading) {
			playerRef.current.load(); // Start loading the video when clicked
			setIsLoading(true);
			playerRef.current.play(); // Start playing the video after it starts loading
		}
	};

	return (
		<video
			ref={playerRef}
			controls
			preload="none"
			poster={poster}
			title={title}
			className="responsive-video"
			onClick={handleVideoClick} // Explicit user interaction
		>
			<source src={src} type="video/mp4" />
			Your browser does not support the video tag.
		</video>
	);
};

export {VideoProvider, Video};

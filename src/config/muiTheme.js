import {createTheme} from "@mui/material";

const theme = createTheme({
	palette: {
		primary: {
			light: "#e7f1e3",
			main: "#95c11f",
			dark: "#006938",
			contrastText: "#fff",
		},
		secondary: {
			light: "#e7f1e3", 
			main: "#9fc8b5",
			dark: "#006938",
			contrastText: "#000",
		},
	},
});

export default theme;
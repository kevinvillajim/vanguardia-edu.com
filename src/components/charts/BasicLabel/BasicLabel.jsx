import {PieChart} from "@mui/x-charts/PieChart";
import Box from "@mui/material/Box";

export default function PieActiveArc({data}) {
	return (
		<Box flexGrow={1}>
			<PieChart
				series={[
					{
						data,
						highlightScope: {faded: "global", highlighted: "item"},
						faded: {innerRadius: 30, additionalRadius: -30, color: "gray"},
					},
				]}
				height={200}
			/>
		</Box>
	);
}

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Box from "@mui/material/Box";

export default function VariantButtonGroup({ buttons }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "& > *": {
          m: 1,
        },
      }}
    >
      <ButtonGroup
        variant="text"
        aria-label="Basic button group"
      >
        {buttons.map((button, key) => (
          <Button
            key={key}
            onClick={button.onClick}
          >
            {button.name}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}

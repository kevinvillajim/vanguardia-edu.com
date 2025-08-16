import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import api from "../../../../config/api";
import {getFromLocalStorage} from "../../../../utils/crypto";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
      theme.palette.mode === "light"
        ? "rgb(55, 65, 81)"
        : theme.palette.grey[300],
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

export default function Options({ course }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const resetProgress = async (curso) => {
    const user = JSON.parse(getFromLocalStorage("user"));
    Object.keys(localStorage).forEach((key) => {
      if (key.includes(`Course${curso}`)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem(`Course${curso}initialOpenIndex`);
    try {
      await api.delete(`/progress/${user.id}/${curso}`);
      console.log(
        `El Progreso del Usuario ${user.id} del curso ${curso}  eliminado.`
      );
    } catch (error) {
      console.error("Error al eliminar progreso:", error);
    }
    window.location.reload();
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <MoreVertIcon color="success" />
      </IconButton>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            resetProgress(course);

            handleClose();
            // window.location.reload();
          }}
          disableRipple
        >
          <RestartAltIcon />
          Reiniciar curso
        </MenuItem>
      </StyledMenu>
    </div>
  );
}

import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Box, Typography, Button, Stack} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

export default function BookingFailurePage() {
  const navigate = useNavigate();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "#fafaf7",
        p: 3,
      }}
    >
      <ErrorOutlineIcon sx={{fontSize: 56, color: "#b42a2a", mb: 2.5}} />

      <Typography
        sx={{
          fontFamily: "'Work Sans'",
          fontWeight: 700,
          fontSize: {xs: 20, md: 24},
          color: "#141414",
          mb: 1,
          textAlign: "center",
        }}
      >
        El pago no pudo ser procesado
      </Typography>

      <Typography
        sx={{
          fontSize: 15,
          color: "#5b5b5b",
          textAlign: "center",
          maxWidth: 440,
          mb: 4,
          lineHeight: 1.65,
        }}
      >
        Hubo un problema al procesar tu pago. Por favor, verificá tus datos e intentá de nuevo.
      </Typography>

      <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
        <Button
          variant="contained"
          onClick={() => navigate("/payment")}
          sx={{
            bgcolor: "#2e7d32",
            "&:hover": {bgcolor: "#3b8a3f"},
            fontFamily: "'Work Sans'",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            px: 4,
            py: 1.5,
          }}
        >
          Intentar de nuevo
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/")}
          sx={{
            borderColor: "#e0e0e0",
            color: "#141414",
            fontFamily: "'Work Sans'",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            px: 4,
            py: 1.5,
            "&:hover": {borderColor: "#bdbdbd", bgcolor: "#f9f9f9"},
          }}
        >
          Volver al inicio
        </Button>
      </Stack>
    </Box>
  );
}

import {useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {Box, CircularProgress, Typography} from "@mui/material";

export default function BookingSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const preferenceId = searchParams.get("preference-id");
      navigate("/schedule", {state: {paymentSuccess: true, preferenceId}});
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

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
      <CircularProgress
        size={48}
        sx={{color: "#2e7d32", mb: 2.5}}
      />
      <Typography
        sx={{
          fontFamily: "'Work Sans'",
          fontWeight: 700,
          fontSize: 18,
          color: "#141414",
          mb: 1,
          textAlign: "center",
        }}
      >
        Procesando tu pago…
      </Typography>
      <Typography sx={{fontSize: 14, color: "#5b5b5b", textAlign: "center"}}>
        Redirigiendo a la página de agendamiento
      </Typography>
    </Box>
  );
}

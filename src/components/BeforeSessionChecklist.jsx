import {Box, Typography, Stack} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const PANEL = {
  bgcolor: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  p: 3,
};

export default function BeforeSessionChecklist() {
  const items = [
    "Llegá 10 min antes para completar el check-in.",
    "No te apliques cremas ni aceites el día de la sesión.",
    "Vení con ropa cómoda, liviana.",
    "Hidratate bien las 24hs previas.",
  ];

  return (
    <Box sx={PANEL}>
      <Typography sx={{fontFamily: "'Work Sans'", fontWeight: 700, fontSize: 16, color: "#141414", mb: 2}}>
        Antes de tu sesión
      </Typography>
      <Stack spacing={1.5}>
        {items.map((item) => (
          <Box key={item} sx={{display: "flex", gap: 1.5, alignItems: "flex-start"}}>
            <CheckCircleIcon sx={{fontSize: 16, color: "#2e7d32", mt: "2px", flexShrink: 0}} />
            <Typography sx={{fontSize: 14, color: "#5b5b5b", lineHeight: 1.5}}>
              {item}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

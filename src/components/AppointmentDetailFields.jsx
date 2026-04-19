import {Box, Typography} from "@mui/material";

export default function AppointmentDetailFields({fields}) {
  return (
    <Box sx={{display: "grid", gridTemplateColumns: {xs: "1fr", sm: "repeat(2, 1fr)"}, gap: "14px"}}>
      {fields.map(({icon, label, value}) => (
        <Box key={label}>
          <Box sx={{display: "flex", alignItems: "center", gap: "6px", mb: "4px"}}>
            {icon && typeof icon === "object" && icon.type
              ? (() => {
                  const IconComponent = icon.type;
                  return <IconComponent sx={{fontSize: 14, color: "#2e7d32"}} />;
                })()
              : icon}
            <Typography sx={{fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#5b5b5b"}}>
              {label}
            </Typography>
          </Box>
          <Typography sx={{fontSize: 15, fontWeight: 600, color: "#141414"}}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

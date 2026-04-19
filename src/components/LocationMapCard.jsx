import {Box, Typography} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export default function LocationMapCard({businessName, address, mapsUrl}) {
  return (
    <Box
      component="a"
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        mt: 2.5,
        p: 2,
        bgcolor: "#fafaf7",
        border: "1px solid #e0e0e0",
        borderRadius: "10px",
        textDecoration: "none",
        color: "inherit",
        transition: "border-color 200ms ease",
        "&:hover": {borderColor: "#3b8a3f"},
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          bgcolor: "#3b8a3f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <PlaceIcon sx={{fontSize: 20, color: "#ffffff"}} />
      </Box>
      <Box sx={{flex: 1}}>
        <Typography sx={{fontWeight: 700, fontSize: 14, color: "#141414"}}>
          {businessName}
        </Typography>
        <Typography sx={{fontSize: 12, color: "#5b5b5b"}}>
          {address}
        </Typography>
      </Box>
      <Box sx={{display: "flex", alignItems: "center", gap: 0.5, fontSize: 12, color: "#2e7d32", fontWeight: 600, flexShrink: 0}}>
        Cómo llegar
        <OpenInNewIcon sx={{fontSize: 13}} />
      </Box>
    </Box>
  );
}

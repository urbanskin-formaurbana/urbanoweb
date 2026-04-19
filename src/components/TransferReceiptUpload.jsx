import {Box, Typography, CircularProgress} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {useRef} from "react";

export default function TransferReceiptUpload({hasFile, fileName, onUpload, uploading}) {
  const fileInputRef = useRef(null);

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={onUpload}
        style={{display: "none"}}
      />
      {hasFile ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1.5px solid #2e7d32",
            borderRadius: "10px",
            bgcolor: "#f2f8f3",
          }}
        >
          <CheckCircleOutlineIcon sx={{color: "#2e7d32", fontSize: 22, flexShrink: 0}} />
          <Box sx={{flex: 1, minWidth: 0}}>
            <Typography sx={{fontWeight: 600, fontSize: 14, color: "#141414"}} noWrap>
              {fileName || "Comprobante adjunto"}
            </Typography>
            <Typography sx={{fontSize: 12, color: "#5b5b5b"}}>
              Recibido · Revisando…
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1.5px dashed #bdbdbd",
            borderRadius: "10px",
            cursor: uploading ? "wait" : "pointer",
            "&:hover": uploading ? {} : {borderColor: "#3b8a3f", bgcolor: "#f3f8f4"},
            transition: "all 0.15s",
          }}
        >
          {uploading ? (
            <CircularProgress size={22} sx={{color: "#2e7d32", flexShrink: 0}} />
          ) : (
            <UploadFileIcon sx={{color: "#8a8a8a", fontSize: 22, flexShrink: 0}} />
          )}
          <Box sx={{flex: 1}}>
            <Typography sx={{fontWeight: 600, fontSize: 14, color: "#141414"}}>
              {uploading ? "Enviando…" : "Adjuntar comprobante"}
            </Typography>
            <Typography sx={{fontSize: 12, color: "#8a8a8a"}}>
              Imagen o PDF
            </Typography>
          </Box>
          <Box
            sx={{
              fontSize: 12,
              fontWeight: 700,
              color: "#141414",
              border: "1.5px solid #e0e0e0",
              borderRadius: "6px",
              px: 1.5,
              py: 0.5,
              bgcolor: "#fff",
            }}
          >
            Elegir archivo
          </Box>
        </Box>
      )}
    </Box>
  );
}

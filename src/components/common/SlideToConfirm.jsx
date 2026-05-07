import { useRef, useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const THUMB = 44;
const THRESHOLD = 0.9;

export default function SlideToConfirm({
  onConfirm,
  label = "Deslizá para confirmar",
  color = "error",
}) {
  const trackRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const clientToProgress = useCallback((clientX) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const usable = rect.width - THUMB;
    return Math.max(0, Math.min(1, (clientX - rect.left - THUMB / 2) / usable));
  }, []);

  const handleMove = useCallback(
    (clientX) => {
      const p = clientToProgress(clientX);
      setProgress(p);
      if (p >= THRESHOLD) {
        setDone(true);
        setDragging(false);
        onConfirm();
      }
    },
    [clientToProgress, onConfirm],
  );

  const handleRelease = useCallback(() => {
    setDragging(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => handleMove(e.touches ? e.touches[0].clientX : e.clientX);
    const onUp = () => handleRelease();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [dragging, handleMove, handleRelease]);

  return (
    <Box
      ref={trackRef}
      sx={{
        position: "relative",
        height: 52,
        borderRadius: 999,
        bgcolor: `${color}.50`,
        border: "1.5px solid",
        borderColor: `${color}.light`,
        overflow: "hidden",
        userSelect: "none",
        mt: 2,
      }}
    >
      {/* fill bar */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${progress * 100}%`,
          bgcolor: `${color}.main`,
          opacity: 0.15 + progress * 0.35,
          transition: dragging ? "none" : "width 0.3s ease",
        }}
      />

      {/* label */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          pl: `${THUMB + 8}px`,
          pr: 2,
        }}
      >
        <Typography variant="body2" fontWeight="medium" color="text.secondary">
          {label}
        </Typography>
      </Box>

      {/* thumb */}
      <Box
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        sx={{
          position: "absolute",
          top: "50%",
          left: `calc(${progress} * (100% - ${THUMB}px))`,
          transform: "translateY(-50%)",
          width: THUMB,
          height: THUMB,
          borderRadius: "50%",
          bgcolor: done ? `${color}.dark` : `${color}.main`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          cursor: done ? "default" : dragging ? "grabbing" : "grab",
          boxShadow: 3,
          transition: dragging
            ? "background-color 0.2s"
            : "left 0.3s ease, background-color 0.2s",
          zIndex: 1,
          touchAction: "none",
          flexShrink: 0,
        }}
      >
        <ArrowForwardIcon fontSize="small" />
      </Box>
    </Box>
  );
}

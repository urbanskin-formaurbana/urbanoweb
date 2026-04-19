import { Box } from "@mui/material";

const STEPS = ["Agendar", "Pago", "Confirmación"];

export default function FlowStepper({ active = 0 }) {
  return (
    <div className="fu-stepper" aria-label="Progreso de reserva">
      {STEPS.map((label, index) => {
        const isDone = index < active;
        const isActive = index === active;
        const itemClass = [
          "fu-stepper__item",
          isDone ? "fu-stepper__item--done" : "",
          isActive ? "fu-stepper__item--active" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Box key={label} sx={{ display: "contents" }}>
            {index > 0 && <div className="fu-stepper__bar" aria-hidden="true" />}
            <div className={itemClass}>
              <span className="fu-stepper__dot">
                <span>{index + 1}</span>
              </span>
              {label}
            </div>
          </Box>
        );
      })}
    </div>
  );
}

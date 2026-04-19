import {useState, useMemo, useEffect, useCallback, useRef} from "react";
import {CircularProgress} from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";
import InfoIcon from "@mui/icons-material/Info";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import WbTwilightIcon from "@mui/icons-material/WbTwilight";
import appointmentService from "../services/appointment_service";
import bankService from "../services/bank_service";
import {
  isCampaignTreatment,
  fetchAllCampaignSlots,
  filterSlotsForCustomer,
} from "../utils/slotUtils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const SESSION_DURATION = 30;
const DOW_ES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MON_ES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];
const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function generateSlotGrid(startTime, endTime) {
  const slots = [];
  let [h, m] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const endMin = eh * 60 + em;
  while (h * 60 + m < endMin) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    m += 30;
    if (m >= 60) {
      h += 1;
      m -= 60;
    }
  }
  return slots;
}

export default function DateTimeSlotPicker({
  treatment = {},
  paymentMode = null,
  filterSlots: filterSlotsProp,
  selectedDate = null,
  onDateChange = () => {},
  selectedTime = null,
  onTimeChange = () => {},
  excludeAppointmentId = null,
}) {
  const [businessHours, setBusinessHours] = useState(null);
  const [emptyDays, setEmptyDays] = useState(new Set());
  const [allCampaignSlots, setAllCampaignSlots] = useState([]);
  const [loadingCampaignSlots, setLoadingCampaignSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const slotCacheRef = useRef({});

  const isCampaign = isCampaignTreatment(treatment);
  const effectiveDuration =
    paymentMode === "evaluacion"
      ? 30
      : treatment.duration_minutes || SESSION_DURATION;
  const memoizedFilterSlots = useCallback(
    filterSlotsProp || filterSlotsForCustomer,
    [filterSlotsProp],
  );

  const days = useMemo(() => {
    const list = [];
    const today = dayjs().tz("America/Montevideo").startOf("day");
    for (let i = 1; i <= 21; i += 1) {
      const d = today.add(i, "day");
      list.push({
        key: d.format("YYYY-MM-DD"),
        dayjsObj: d,
        dow: DOW_ES[d.day()],
        day: d.date(),
        mon: MON_ES[d.month()],
      });
    }
    return list;
  }, []);

  const campaignDates = useMemo(() => {
    if (!isCampaign || allCampaignSlots.length === 0) return new Set();
    const filtered = memoizedFilterSlots(allCampaignSlots);
    return new Set(
      filtered.map((s) =>
        dayjs.utc(s).tz("America/Montevideo").format("YYYY-MM-DD"),
      ),
    );
  }, [isCampaign, allCampaignSlots, memoizedFilterSlots]);

  useEffect(() => {
    if (isCampaign) return;
    bankService
      .getBankDetails()
      .then((data) => {
        setBusinessHours(data?.business_hours || {});
      })
      .catch((err) => {
        setBusinessHours({});
      });
  }, [isCampaign]);

  useEffect(() => {
    if (!isCampaign) return;
    let cancelled = false;
    setLoadingCampaignSlots(true);
    fetchAllCampaignSlots(treatment, paymentMode)
      .then((slots) => {
        if (!cancelled) setAllCampaignSlots(slots);
      })
      .catch(() => {
        if (!cancelled) setAllCampaignSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingCampaignSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCampaign, treatment, paymentMode]);

  const durationReady =
    paymentMode === "evaluacion" ||
    treatment.duration_minutes != null ||
    isCampaign;

  useEffect(() => {
    if (isCampaign || !businessHours || !durationReady) {
      return;
    }
    let cancelled = false;

    const enabledDays = days.filter((d) => {
      const wkey = WEEKDAY_KEYS[d.dayjsObj.day()];
      return businessHours[wkey]?.enabled === true;
    });

    const initialEmpty = new Set();
    days.forEach((d) => {
      const wkey = WEEKDAY_KEYS[d.dayjsObj.day()];
      if (businessHours[wkey]?.enabled !== true) {
        initialEmpty.add(d.key);
      }
    });
    setEmptyDays(initialEmpty);

    const BATCH_SLICES = [
      [0, 1],
      [1, 2],
      [2, 4],
      [4, 7],
      [7, 12],
      [12, undefined],
    ];

    const runBatches = async () => {
      for (const [start, end] of BATCH_SLICES) {
        if (cancelled) return;

        const batch = enabledDays.slice(start, end);
        if (batch.length === 0) continue;

        try {
          const result = await appointmentService.getAvailableSlotsBatch(
            batch.map((d) => d.dayjsObj.toDate()),
            effectiveDuration,
            excludeAppointmentId,
          );

          if (cancelled) return;

          batch.forEach((d) => {
            const isoSlots = result[d.key] ?? [];
            slotCacheRef.current[d.key] = isoSlots;
          });

          setEmptyDays((prev) => {
            const next = new Set(prev);
            batch.forEach((d) => {
              const isoSlots = result[d.key] ?? [];
              if (isoSlots.length === 0) next.add(d.key);
              else next.delete(d.key);
            });
            return next;
          });
        } catch (err) {
          if (!cancelled) {
            batch.forEach((d) => {
              setEmptyDays((prev) => new Set(prev).add(d.key));
            });
          }
        }
      }
    };

    runBatches();

    return () => {
      cancelled = true;
    };
  }, [
    isCampaign,
    businessHours,
    durationReady,
    effectiveDuration,
    excludeAppointmentId,
  ]);

  const dateKey = selectedDate?.format("YYYY-MM-DD") ?? null;

  useEffect(() => {
    if (!dateKey) {
      setAvailableSlots([]);
      return;
    }

    if (isCampaign && allCampaignSlots.length > 0) {
      const filtered = allCampaignSlots.filter(
        (s) =>
          dayjs.utc(s).tz("America/Montevideo").format("YYYY-MM-DD") ===
          dateKey,
      );
      const slots = memoizedFilterSlots(filtered).map((s) =>
        dayjs.utc(s).tz("America/Montevideo").format("HH:mm"),
      );
      setAvailableSlots(slots);
      setLoadingSlots(false);
      return;
    }

    if (isCampaign) {
      setAvailableSlots([]);
      setLoadingSlots(false);
      return;
    }

    const cached = slotCacheRef.current[dateKey];
    if (cached !== undefined) {
      const slots = memoizedFilterSlots(cached).map((s) =>
        dayjs.utc(s).tz("America/Montevideo").format("HH:mm"),
      );
      setAvailableSlots(slots);
      setLoadingSlots(false);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);
    appointmentService
      .getAvailableSlots(
        selectedDate.toDate(),
        effectiveDuration,
        excludeAppointmentId,
      )
      .then((isoSlots) => {
        if (cancelled) return;
        slotCacheRef.current[dateKey] = isoSlots;
        const slots = memoizedFilterSlots(isoSlots).map((s) =>
          dayjs.utc(s).tz("America/Montevideo").format("HH:mm"),
        );
        setAvailableSlots(slots);
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    dateKey,
    isCampaign,
    allCampaignSlots,
    memoizedFilterSlots,
    selectedDate,
    effectiveDuration,
    excludeAppointmentId,
  ]);

  const selectedWkey = selectedDate ? WEEKDAY_KEYS[selectedDate.day()] : null;
  const dayHours =
    selectedWkey && businessHours ? businessHours[selectedWkey] : null;
  const allGridSlots = dayHours
    ? generateSlotGrid(dayHours.start_time, dayHours.end_time)
    : [];

  const renderedMorningSlots = isCampaign
    ? [...availableSlots.filter((t) => t < "14:00")].sort()
    : allGridSlots.filter((t) => t < "14:00");

  const renderedAfternoonSlots = isCampaign
    ? [...availableSlots.filter((t) => t >= "14:00")].sort()
    : allGridSlots.filter((t) => t >= "14:00");

  const monthLabel =
    days[0]?.dayjsObj.format("MMMM YYYY").charAt(0).toUpperCase() +
    days[0]?.dayjsObj.format("MMMM YYYY").slice(1);

  return (
    <div>
      <div className="fu-datepicker">
        <div className="fu-datepicker__nav">
          <div className="fu-datepicker__nav-month">{monthLabel}</div>
          <span style={{fontSize: 12, color: "var(--fu-ink-400)"}}>
            Próximos 21 días
          </span>
        </div>

        {isCampaign && loadingCampaignSlots ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0",
            }}
          >
            <CircularProgress size={28} sx={{color: "#2e7d32"}} />
          </div>
        ) : (
          <div className="fu-datepicker__strip">
            {days.map((d) => {
              const wkey = WEEKDAY_KEYS[d.dayjsObj.day()];
              const hasBusinessHours = businessHours && businessHours[wkey]?.enabled === true;
              const isDisabled = isCampaign
                ? !campaignDates.has(d.key)
                : (!hasBusinessHours || emptyDays.has(d.key));
              const isActive = selectedDate?.format("YYYY-MM-DD") === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  disabled={isDisabled}
                  className={`fu-daychip ${isActive ? "active" : ""}`.trim()}
                  onClick={() => {
                    if (isDisabled) return;
                    onDateChange(d.dayjsObj);
                  }}
                >
                  <span className="fu-daychip__dow">{d.dow}</span>
                  <span className="fu-daychip__day">{d.day}</span>
                  <span className="fu-daychip__mon">{d.mon}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div style={{marginTop: 20}}>
          {loadingSlots ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "14px 0",
              }}
            >
              <CircularProgress size={28} sx={{color: "#2e7d32"}} />
            </div>
          ) : availableSlots.length === 0 ? (
            <p
              style={{
                fontSize: 14,
                color: "var(--fu-ink-400)",
                textAlign: "center",
                margin: 0,
              }}
            >
              No hay horarios disponibles para este día.
            </p>
          ) : (
            <>
              <div className="fu-timegroup">
                <div className="fu-timegroup__label">
                  <WbSunnyIcon sx={{fontSize: 16}} /> Mañana
                </div>
                <div className="fu-timegrid">
                  {renderedMorningSlots.map((time) => {
                    const available = availableSlots.includes(time);
                    const active = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        className={`fu-timechip ${active ? "active" : ""}`.trim()}
                        onClick={() => available && onTimeChange(time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="fu-timegroup">
                <div className="fu-timegroup__label">
                  <WbTwilightIcon sx={{fontSize: 16}} /> Tarde
                </div>
                <div className="fu-timegrid">
                  {renderedAfternoonSlots.map((time) => {
                    const available = availableSlots.includes(time);
                    const active = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        className={`fu-timechip ${active ? "active" : ""}`.trim()}
                        onClick={() => available && onTimeChange(time)}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <p
                style={{
                  fontSize: 12,
                  color: "var(--fu-ink-400)",
                  margin: "10px 0 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <InfoIcon sx={{fontSize: 14}} />
                Los horarios tachados ya están reservados.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

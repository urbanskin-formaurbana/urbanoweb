import { useState, useEffect, useMemo, memo } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { isCampaignTreatment, fetchAllCampaignSlots } from '../utils/slotUtils';
import appointmentService from '../services/appointment_service';

dayjs.extend(utc);
dayjs.extend(timezone);

const DateSelectionSection = memo(({
  isCampaign,
  loadingCampaignSlots,
  campaignDates,
  selectedDate,
  onDateChange,
}) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarMonthIcon color="success" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Selecciona la fecha
        </Typography>
      </Box>

      {isCampaign ? (
        loadingCampaignSlots ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={32} />
          </Box>
        ) : campaignDates.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            {campaignDates.map((dateStr) => (
              <Button
                key={dateStr}
                variant={
                  selectedDate?.format('YYYY-MM-DD') === dateStr
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() =>
                  onDateChange(dayjs.tz(dateStr, 'America/Montevideo'))
                }
                size="small"
                sx={{ py: 1, fontSize: '0.85rem' }}
              >
                {dayjs(dateStr).format('ddd D MMM')}
              </Button>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay fechas disponibles en la campaña
          </Typography>
        )
      ) : (
        <DatePicker
          value={selectedDate}
          onChange={onDateChange}
          minDate={dayjs().add(1, 'day')}
          maxDate={dayjs().add(30, 'days')}
          slotProps={{
            textField: { fullWidth: true, variant: 'outlined' },
          }}
        />
      )}
    </Paper>
  </Grid>
));

DateSelectionSection.displayName = 'DateSelectionSection';

const TimeSelectionSection = memo(({
  selectedDate,
  loadingSlots,
  availableSlots,
  selectedTime,
  onTimeChange,
}) => (
  <Grid size={{ xs: 12, sm: 6 }}>
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccessTimeIcon color="success" />
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Selecciona la hora
        </Typography>
      </Box>

      {selectedDate ? (
        loadingSlots ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={32} />
          </Box>
        ) : availableSlots.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              maxHeight: '250px',
              overflowY: 'auto',
            }}
          >
            {availableSlots.map((slot) => (
              <Button
                key={slot.format('HH:mm')}
                variant={
                  selectedTime?.format('HH:mm') === slot.format('HH:mm')
                    ? 'contained'
                    : 'outlined'
                }
                onClick={() => onTimeChange(slot)}
                size="small"
                sx={{ py: 1, fontSize: '0.85rem' }}
              >
                {slot.format('HH:mm')}
              </Button>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="error">
            No hay horarios disponibles para esta fecha
          </Typography>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Selecciona una fecha para ver horarios disponibles
        </Typography>
      )}
    </Paper>
  </Grid>
));

TimeSelectionSection.displayName = 'TimeSelectionSection';

/**
 * DateTimeSlotPicker — Shared date+time selection UI
 *
 * For campaigns: fetches all available slots ONCE, then derives dates and
 * filters time slots from the cache (no second API call, instant date switching).
 *
 * For regular treatments: fetches slots per-date via appointmentService.
 */
export default function DateTimeSlotPicker({
  treatment,
  paymentMode,
  filterSlots,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  excludeAppointmentId,
}) {
  const [allCampaignSlots, setAllCampaignSlots] = useState([]);
  const [loadingCampaignSlots, setLoadingCampaignSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotCache, setSlotCache] = useState({}); // Cache for fetched slots by date

  const isCampaign = isCampaignTreatment(treatment);

  // Fetch ALL campaign slots once (treatment is memoized in parents, so this
  // only re-runs when the actual treatment identity changes)
  useEffect(() => {
    if (!isCampaign) {
      setAllCampaignSlots([]);
      return;
    }

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

    return () => { cancelled = true; };
  }, [isCampaign, treatment, paymentMode]);

  // Derive campaign dates from cached slots (no state, no effect)
  const campaignDates = useMemo(() => {
    if (allCampaignSlots.length === 0) return [];
    return [
      ...new Set(
        allCampaignSlots.map((slot) =>
          dayjs.utc(slot).tz('America/Montevideo').format('YYYY-MM-DD'),
        ),
      ),
    ].sort();
  }, [allCampaignSlots]);

  // Load time slots when date changes
  const dateKey = selectedDate?.format('YYYY-MM-DD') ?? null;

  useEffect(() => {
    if (!dateKey) {
      setAvailableSlots([]);
      return;
    }

    // Campaign: filter from cached slots (synchronous, instant)
    if (isCampaign && allCampaignSlots.length > 0) {
      const filtered = allCampaignSlots.filter(
        (slot) => dayjs.utc(slot).tz('America/Montevideo').format('YYYY-MM-DD') === dateKey,
      );
      const slots = filterSlots(filtered).map((s) =>
        dayjs.utc(s).tz('America/Montevideo'),
      );
      setAvailableSlots(slots);
      return;
    }

    // Campaign still loading — wait for cache
    if (isCampaign && allCampaignSlots.length === 0) {
      setAvailableSlots([]);
      return;
    }

    // Regular treatment: check cache first, then fetch from API
    if (slotCache[dateKey]) {
      setAvailableSlots(slotCache[dateKey]);
      return;
    }

    let cancelled = false;
    setLoadingSlots(true);

    appointmentService
      .getAvailableSlots(
        selectedDate.toDate(),
        treatment?.duration_minutes || 90,
        excludeAppointmentId,
      )
      .then((slotStrings) => {
        if (cancelled) return;
        const slots = filterSlots(slotStrings).map((s) =>
          dayjs.utc(s).tz('America/Montevideo'),
        );
        setAvailableSlots(slots);
        // Cache the result for this date
        setSlotCache((prev) => ({ ...prev, [dateKey]: slots }));
      })
      .catch(() => {
        if (!cancelled) setAvailableSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => { cancelled = true; };
  }, [dateKey, isCampaign, allCampaignSlots, filterSlots, selectedDate, treatment, excludeAppointmentId, slotCache]);

  return (
    <Grid container spacing={3}>
      <DateSelectionSection
        isCampaign={isCampaign}
        loadingCampaignSlots={loadingCampaignSlots}
        campaignDates={campaignDates}
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      <TimeSelectionSection
        selectedDate={selectedDate}
        loadingSlots={loadingSlots}
        availableSlots={availableSlots}
        selectedTime={selectedTime}
        onTimeChange={onTimeChange}
      />
    </Grid>
  );
}

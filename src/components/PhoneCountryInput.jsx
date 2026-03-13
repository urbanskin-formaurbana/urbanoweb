import { useMemo, useState, useEffect } from 'react';
import { Box, TextField, Autocomplete, Typography } from '@mui/material';
import { COUNTRIES, DEFAULT_COUNTRY, formatPhoneWithPrefix, extractCountryAndPhone, formatPhoneDisplay } from '../utils/countries';

/**
 * PhoneCountryInput - Combined country selector + phone number input
 * Allows user to select country and enter phone number separately
 */
export default function PhoneCountryInput({
  value = '', // Full phone number with prefix (e.g., '59898123456')
  onChange,
  error = false,
  helperText = '',
  disabled = false,
  label = 'Número de WhatsApp',
}) {
  // Local state for selected country to preserve selection even when phone is empty
  const [selectedCountry, setSelectedCountry] = useState(() => extractCountryAndPhone(value).country);

  // Extract only phone number from stored value
  const phoneNumber = useMemo(() => {
    return extractCountryAndPhone(value).phoneNumber;
  }, [value]);

  // Sync selected country when parent value changes (e.g., loading from DB)
  // Only sync if value is non-empty to preserve local selection during initial entry
  useEffect(() => {
    if (value) {
      const { country } = extractCountryAndPhone(value);
      setSelectedCountry(country);
    }
  }, [value]);

  const handleCountryChange = (event, newCountry) => {
    if (!newCountry) return;
    // Update local state to persist selection
    setSelectedCountry(newCountry);
    // When country changes, reconstruct phone with new country code
    const formatted = formatPhoneWithPrefix(newCountry.prefix, phoneNumber);
    onChange?.(formatted);
  };

  const handlePhoneChange = (event) => {
    const inputValue = event.target.value;
    // Extract only digits, limit to country's max length
    const maxLength = selectedCountry?.phoneLength || DEFAULT_COUNTRY.phoneLength;
    const digits = inputValue.replace(/\D/g, '').slice(0, maxLength);

    // Update parent with full number (country prefix + digits)
    const fullNumber = formatPhoneWithPrefix(selectedCountry?.prefix || DEFAULT_COUNTRY.prefix, digits);
    onChange?.(fullNumber);
  };

  // For display: show formatted phone number with country-specific pattern
  const displayPhone = useMemo(() => {
    const digits = phoneNumber.replace(/\D/g, '');
    if (!digits) return '';
    const pattern = selectedCountry?.phonePattern || DEFAULT_COUNTRY.phonePattern;
    return formatPhoneDisplay(digits, pattern);
  }, [phoneNumber, selectedCountry]);

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, alignItems: { xs: 'stretch', sm: 'flex-start' } }}>
      {/* Country Selector */}
      <Autocomplete
        options={COUNTRIES}
        getOptionLabel={(option) => `${option.flag} ${option.name} (+${option.prefix})`}
        value={selectedCountry || DEFAULT_COUNTRY}
        onChange={handleCountryChange}
        disabled={disabled}
        disableClearable
        sx={{ minWidth: { xs: '100%', sm: 200 } }}
        slotProps={{
          paper: {
            sx: {
              '& .MuiAutocomplete-option': {
                padding: '8px 12px !important',
              },
            },
          },
          listbox: {
            sx: { maxHeight: 200 },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="País"
            variant="outlined"
            size="small"
            disabled={disabled}
            sx={{
              '& .MuiInputBase-root': disabled ? { bgcolor: 'action.disabledBackground' } : {},
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...rest } = props;
          return (
            <Box key={key} component="li" {...rest}>
              <span>{option.flag}</span>
              <span style={{ marginLeft: 8 }}>{option.name}</span>
              <span style={{ marginLeft: 'auto', color: '#999', fontSize: '0.85em' }}>
                +{option.prefix}
              </span>
            </Box>
          );
        }}
      />

      {/* Phone Number Input */}
      <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            +{selectedCountry?.prefix || DEFAULT_COUNTRY.prefix}
          </Typography>
          <TextField
            label={label}
            placeholder="ej: 98 123 456"
            value={displayPhone}
            onChange={handlePhoneChange}
            error={error}
            fullWidth
            disabled={disabled}
            size="small"
            inputProps={{ inputMode: 'tel' }}
            slotProps={{
              input: { readOnly: disabled },
            }}
            sx={{
              '& .MuiInputBase-root': disabled ? { bgcolor: 'action.disabledBackground' } : {},
            }}
          />
        </Box>
        {helperText && (
          <Typography variant="caption" color={error ? 'error' : 'textSecondary'}>
            {helperText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

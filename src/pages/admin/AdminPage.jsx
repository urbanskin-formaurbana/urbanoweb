import { useState } from 'react';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Button,
  Typography,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAuth } from '../../contexts/AuthContext';
import AppointmentsTab from './tabs/AppointmentsTab';
import TemplatesTab from './tabs/TemplatesTab';
import TreatmentsTab from './tabs/TreatmentsTab';
import SociosTab from './tabs/SociosTab';
import ReportesTab from './tabs/ReportesTab';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);

  const tabLabels = ['Pendientes', 'Confirmadas', 'Todas', 'Plantillas', 'Tratamientos', 'Socios', 'Reportes'];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Panel Admin
        </Typography>
        <Button size="small" variant="outlined" color="inherit" onClick={handleLogout}>
          Salir
        </Button>
      </Box>

      {/* Navigation — Select on mobile, Tabs on desktop */}
      {isMobile ? (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="admin-tab-label">Sección</InputLabel>
          <Select
            labelId="admin-tab-label"
            value={activeTab}
            label="Sección"
            onChange={(e) => setActiveTab(Number(e.target.value))}
          >
            {tabLabels.map((label, index) => (
              <MenuItem key={index} value={index}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      )}

      {/* Tab Content */}
      {(activeTab === 0 || activeTab === 1 || activeTab === 2) && (
        <AppointmentsTab activeTab={activeTab} />
      )}
      {activeTab === 3 && <TemplatesTab />}
      {activeTab === 4 && <TreatmentsTab />}
      {activeTab === 5 && <SociosTab />}
      {activeTab === 6 && <ReportesTab />}
    </Container>
  );
}

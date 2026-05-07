import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Typography,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAuth } from '../../contexts/AuthContext';
import AppointmentsTab from './tabs/AppointmentsTab';
import PagosTab from './tabs/PagosTab';
import TemplatesTab from './tabs/TemplatesTab';
import TreatmentsTab from './tabs/TreatmentsTab';
import SociosTab from './tabs/SociosTab';
import ReportesTab from './tabs/ReportesTab';
import CampaignsTab from './tabs/CampaignsTab';
import BusinessDetailsTab from './tabs/BusinessDetailsTab';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    requestAnimationFrame(() => window.scrollTo(0, 0));
  }, []);

  const [activeTab, setActiveTab] = useState(0);

  const tabLabels = ['Bandeja', 'Pendientes', 'Confirmadas', 'Todas', 'Plantillas', 'Tratamientos', 'Socios', 'Reportes', 'Campañas', 'Datos del Negocio'];

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2, minHeight: '100vh' }}>
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      )}

      {/* Tab Content */}
      {activeTab === 0 && <PagosTab />}
      {(activeTab === 1 || activeTab === 2 || activeTab === 3) && (
        <AppointmentsTab activeTab={activeTab - 1} onGoToPagos={() => setActiveTab(0)} />
      )}
      {activeTab === 4 && <TemplatesTab />}
      {activeTab === 5 && <TreatmentsTab />}
      {activeTab === 6 && <SociosTab />}
      {activeTab === 7 && <ReportesTab />}
      {activeTab === 8 && <CampaignsTab />}
      {activeTab === 9 && <BusinessDetailsTab />}
    </Container>
  );
}

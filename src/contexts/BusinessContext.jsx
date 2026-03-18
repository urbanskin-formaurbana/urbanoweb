import { createContext, useContext, useEffect, useState } from 'react';
import bankService from '../services/bank_service';

const BusinessContext = createContext();

const DEFAULT_WHATSAPP = '59893770785';
const DEFAULT_EMAIL = 'urbanskin.uy@gmail.com';

export function BusinessProvider({ children }) {
  const [whatsappPhone, setWhatsappPhone] = useState(DEFAULT_WHATSAPP);
  const [businessEmail, setBusinessEmail] = useState(DEFAULT_EMAIL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBusinessDetails = async () => {
      try {
        const data = await bankService.getBankDetails();
        if (data.whatsapp_phone) {
          setWhatsappPhone(data.whatsapp_phone);
        }
        if (data.business_email) {
          setBusinessEmail(data.business_email);
        }
      } catch (error) {
        console.error('Error loading business details:', error);
        // Use default fallbacks
      } finally {
        setLoading(false);
      }
    };

    loadBusinessDetails();
  }, []);

  return (
    <BusinessContext.Provider value={{ whatsappPhone, businessEmail, loading }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}

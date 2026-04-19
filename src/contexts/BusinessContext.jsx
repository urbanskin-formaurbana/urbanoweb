import { createContext, useContext, useEffect, useState } from 'react';
import bankService from '../services/bank_service';

const BusinessContext = createContext();

const DEFAULT_WHATSAPP = '59893770785';
const DEFAULT_EMAIL = 'urbanskin.uy@gmail.com';
const DEFAULT_ADDRESS = 'Convención 1378. Galería Libertador. Local 80. Montevideo Centro';

export function BusinessProvider({ children }) {
  const [whatsappPhone, setWhatsappPhone] = useState(DEFAULT_WHATSAPP);
  const [businessEmail, setBusinessEmail] = useState(DEFAULT_EMAIL);
  const [businessAddress, setBusinessAddress] = useState(DEFAULT_ADDRESS);
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
        if (data.business_address) {
          setBusinessAddress(data.business_address);
        }
      } catch (error) {
        // Use default fallbacks
      } finally {
        setLoading(false);
      }
    };

    loadBusinessDetails();
  }, []);

  return (
    <BusinessContext.Provider value={{ whatsappPhone, businessEmail, businessAddress, loading }}>
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

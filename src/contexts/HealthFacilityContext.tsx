import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { healthFacilitiesApi, HealthFacility } from '../services/healthFacilitiesApi';
import { useAuthStore } from '../store/authStore';

type HealthFacilityError = Error | null;

interface HealthFacilityAttributes {
  name: string;
  khmerName: string;
  Contact: {
    Phone: string | null;
    Email: string | null;
    Location: string | null;
  };
  exchange: number | null;
}

interface HealthFacilityWithAttributes extends HealthFacility {
  attributes: HealthFacilityAttributes;
}

interface HealthFacilityContextType {
  currentFacility: HealthFacilityWithAttributes | null;
  setCurrentFacility: (facility: HealthFacilityWithAttributes | null) => void;
  facilities: HealthFacilityWithAttributes[];
  isLoading: boolean;
  error: HealthFacilityError;
}

const HealthFacilityContext = createContext<HealthFacilityContextType | undefined>(undefined);

interface HealthFacilityProviderProps {
  children: React.ReactNode;
}

export const HealthFacilityProvider: React.FC<HealthFacilityProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [currentFacility, setCurrentFacility] = useState<HealthFacilityWithAttributes | null>(null);

  const { data: facilities = [], isLoading, error } = useQuery<HealthFacility[], HealthFacilityError>(
    'healthFacilities',
    healthFacilitiesApi.getAll,
    {
      onSuccess: (data) => {
        // If user has an assigned facility and no current facility is set
        if (user?.hf?.id && !currentFacility) {
          const userFacility = data.find(f => f.id === user.hf.id);
          if (userFacility) {
            const initializedFacility = initializeFacility(userFacility);
            setCurrentFacility(initializedFacility);
          }
        }
        // If no user facility and no current facility, set first available
        else if (!currentFacility && data.length > 0 && !user?.hf) {
          const firstFacility = initializeFacility(data[0]);
          setCurrentFacility(firstFacility);
        }
      },
    }
  );

  // Reset current facility when user changes
  useEffect(() => {
    if (user?.hf?.id && facilities.length > 0) {
      const userFacility = facilities.find(f => f.id === user.hf.id);
      if (userFacility) {
        const initializedFacility = initializeFacility(userFacility);
        setCurrentFacility(initializedFacility);
      }
    } else if (!user?.hf && facilities.length > 0) {
      const firstFacility = initializeFacility(facilities[0]);
      setCurrentFacility(firstFacility);
    }
  }, [user, facilities]);

  const handleSetCurrentFacility = (facility: HealthFacilityWithAttributes | null) => {
    // Only allow changing facility if user doesn't have an assigned facility
    if (!user?.hf || (facility && facility.id === user.hf.id)) {
      setCurrentFacility(facility ? initializeFacility(facility) : null);
    }
  };

  const contextValue = useMemo(() => ({
    currentFacility,
    setCurrentFacility: handleSetCurrentFacility,
    facilities: facilities.map(facility => initializeFacility(facility)),
    isLoading,
    error,
  }), [currentFacility, facilities, isLoading, error, user]);

  return (
    <HealthFacilityContext.Provider value={contextValue}>
      {children}
    </HealthFacilityContext.Provider>
  );
};

const initializeFacility = (facility: HealthFacility): HealthFacilityWithAttributes => ({
  ...facility,
  attributes: {
    ...facility.attributes,
    Contact: {
      Phone: facility.attributes.Contact?.Phone || null,
      Email: facility.attributes.Contact?.Email || null,
      Location: facility.attributes.Contact?.Location || null,
    },
    exchange: facility.attributes.exchange || null,
  },
});

export const useHealthFacility = (): HealthFacilityContextType => {
  const context = useContext(HealthFacilityContext);
  if (context === undefined) {
    throw new Error('useHealthFacility must be used within a HealthFacilityProvider');
  }
  return context;
};
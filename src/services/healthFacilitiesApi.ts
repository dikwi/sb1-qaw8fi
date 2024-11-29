import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface Adm {
  id: number;
  lock: boolean;
  active: boolean;
  hf: string | null;
}

export interface Room {
  id?: number;
  __component: 'facility.rooms';
  name: string;
  building: string | null;
  floor: string | null;
  type: string | null;
  hasAircon: boolean | null;
}

export interface Contact {
  id?: number;
  Phone: string | null;
  Email: string | null;
  Location: string | null;
}

export interface HeaderImage {
  data: {
    id: number;
    attributes: {
      url: string;
      formats: {
        thumbnail: { url: string };
        small: { url: string };
        medium: { url: string };
        large: { url: string };
      };
    };
  } | null;
}

export interface HealthFacility {
  id: number;
  attributes: {
    name: string;
    khmerName: string;
    sign: boolean | null;
    p2: boolean | null;
    p3: boolean | null;
    nss: boolean | null;
    currency: 'KHR' | 'USD' | null;
    exchange: number | null;
    Contact: Contact;
    rooms: Room[];
    header: HeaderImage;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateHealthFacilityData {
  name: string;
  khmerName: string;
  sign?: boolean | null;
  p2?: boolean | null;
  p3?: boolean | null;
  nss?: boolean | null;
  exchange?: number | null;
  Contact: Omit<Contact, 'id'>;
  rooms?: Omit<Room, 'id'>[];
}

export const healthFacilitiesApi = {
  getAll: async (): Promise<HealthFacility[]> => {
    try {
      const response = await axios.get(`${API_URL}/health-facilities?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching health facilities:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<HealthFacility | null> => {
    try {
      const response = await axios.get(`${API_URL}/health-facilities/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching health facility:', error);
      return null;
    }
  },

  create: async (facilityData: CreateHealthFacilityData): Promise<HealthFacility> => {
    try {
      const response = await axios.post(`${API_URL}/health-facilities`, {
        data: facilityData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating health facility:', error);
      throw error;
    }
  },

  update: async (id: number, facilityData: Partial<CreateHealthFacilityData>): Promise<HealthFacility> => {
    try {
      const response = await axios.put(`${API_URL}/health-facilities/${id}`, {
        data: facilityData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating health facility:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/health-facilities/${id}`);
    } catch (error) {
      console.error('Error deleting health facility:', error);
      throw error;
    }
  }
};
import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface Appointment {
  id?: number;
  attributes: {
    patientName: string;
    doctorName: string;
    date: string;
    status: 'Scheduled' | 'Completed' | 'Canceled';
    note: string;
    healthFacility: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export const appointmentsApi = {
  getAll: async (): Promise<Appointment[]> => {
    try {
      const response = await axios.get(`${API_URL}/appointments`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  create: async (appointmentData: Omit<Appointment['attributes'], 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    try {
      const response = await axios.post(`${API_URL}/appointments`, {
        data: {
          ...appointmentData,
          // Ensure all fields are properly formatted
          date: new Date(appointmentData.date).toISOString(),
          note: appointmentData.note || '',
          healthFacility: appointmentData.healthFacility || ''
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  update: async (id: number, appointmentData: Partial<Appointment['attributes']>): Promise<Appointment> => {
    try {
      const response = await axios.put(`${API_URL}/appointments/${id}`, {
        data: {
          ...appointmentData,
          // Ensure date is properly formatted if it exists
          ...(appointmentData.date && { date: new Date(appointmentData.date).toISOString() })
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/appointments/${id}`);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};
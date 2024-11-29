import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface NssfVisitCase {
  id: number;
  attributes: {
    code: string;
    name: string;
    khmerName: string;
    sta_rec_code: 'ACTIV' | 'INACT';
    createdAt: string;
    updatedAt: string;
  };
}

const handleApiError = (error: any): never => {
  // Create a serializable error object
  const errorInfo = {
    message: error?.response?.data?.error?.message || error.message || 'An error occurred',
    status: error?.response?.status,
    statusText: error?.response?.statusText,
  };

  // Log error for debugging
  console.error('API Error:', JSON.stringify(errorInfo));

  // Throw error with message only
  throw new Error(errorInfo.message);
};

export const nssfVisitCasesApi = {
  getAll: async (): Promise<NssfVisitCase[]> => {
    try {
      const response = await axios.get(`${API_URL}/nssf-medical-visit-cases?populate=*`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: number): Promise<NssfVisitCase | null> => {
    try {
      const response = await axios.get(`${API_URL}/nssf-medical-visit-cases/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getActive: async (): Promise<NssfVisitCase[]> => {
    try {
      const response = await axios.get(`${API_URL}/nssf-medical-visit-cases`, {
        params: {
          'filters[sta_rec_code][$eq]': 'ACTIV',
          'populate': '*'
        }
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};
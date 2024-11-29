import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface VisitCase {
  id: number;
  attributes: {
    med_vis_ref: string;
    med_vis_cas_ref: string;
    lum_srv_id: string;
    typ_lum_ser_id: number;
    med_vis_cas_org_hls_shortcut: string;
    med_vis_cas_price_khr: number;
    med_vis_cas_exc_rate_khr: number;
    med_vis_cas_is_contract_hf: string;
    sta_rec_code: string;
    createdAt: string;
    updatedAt: string;
    med_vis_id: {
      data: {
        id: number;
        attributes: {
          med_vis_ref: string;
          med_vis_code: string;
          med_vis_entry_date: string;
          med_vis_discharge_date: string;
          cat_vis_id: string;
          sub_cat_vis_id: string;
          typ_vis_id: string;
          typ_med_vis_id: string;
          sta_rec_code: string;
        };
      };
    };
    hea_fac_id: {
      data: {
        id: number;
        attributes: {
          name: string;
          khmerName: string;
          sign: boolean;
          p2: boolean;
          p3: boolean;
          nss: boolean;
          exchange: number;
          currency: string;
        };
      };
    };
  };
}

export interface CreateVisitCaseData {
  med_vis_ref: string;
  med_vis_cas_ref: string;
  lum_srv_id: string;
  typ_lum_ser_id: number;
  med_vis_cas_org_hls_shortcut: string;
  med_vis_cas_price_khr: number;
  med_vis_cas_exc_rate_khr: number;
  med_vis_cas_is_contract_hf: string;
  sta_rec_code: string;
  med_vis_id: number;
  hea_fac_id: number;
}

const handleApiError = (error: any): never => {
  const errorInfo = {
    message: error?.response?.data?.error?.message || error.message || 'An error occurred',
    status: error?.response?.status,
    statusText: error?.response?.statusText,
  };

  console.error('API Error:', JSON.stringify(errorInfo));
  throw new Error(errorInfo.message);
};

export const visitCasesApi = {
  getAll: async (): Promise<VisitCase[]> => {
    try {
      const response = await axios.get(`${API_URL}/nssf-medical-visit-cases?populate=*`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getById: async (id: number): Promise<VisitCase | null> => {
    try {
      const response = await axios.get(`${API_URL}/nssf-medical-visit-cases/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getActive: async (): Promise<VisitCase[]> => {
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
  },

  create: async (data: CreateVisitCaseData): Promise<VisitCase> => {
    try {
      const response = await axios.post(`${API_URL}/nssf-medical-visit-cases`, {
        data: data
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (id: number, data: Partial<CreateVisitCaseData>): Promise<VisitCase> => {
    try {
      const response = await axios.put(`${API_URL}/nssf-medical-visit-cases/${id}`, {
        data: data
      });
      return response.data.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/nssf-medical-visit-cases/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Helper method to generate visit case reference
  generateVisitCaseRef: (prefix: string = 'VC'): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${random}`;
  }
};
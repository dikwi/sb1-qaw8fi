import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface Visit {
  id: number;
  attributes: {
    visitNo: string;
    dateIn: string;
    dateOut: string | null;
    category: string;
    doctor: string;
    diagnosis: string;
    department: string;
    room: string;
    step: number;
    status: string;
    timeElapsed: string;
    allergy: string | null;
    chiefComplaint: string | null;
    historyPresentIllness: string | null;
    socialHistory: {
      smoking: string | null;
      alcohol: string | null;
    };
    pastMedicalHistory: {
      htn: string | null;
      t2dm: string | null;
      antiTB: string | null;
    };
    specialist: string | null;
    newOld: 'NEW' | 'OLD';
    description: string | null;
    services: {
      labo: boolean;
      echo: boolean;
      xray: boolean;
      endo: boolean;
      scan: boolean;
      ecg: boolean;
      kine: boolean;
      vaccin: boolean;
    };
    patient: {
      data: {
        id: number;
        attributes: {
          name: string;
        };
      };
    };
    hf: {
      data: {
        id: number;
        attributes: {
          name: string;
          khmerName: string;
        };
      };
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateVisitData {
  visitNo: string;
  dateIn: string;
  dateOut?: string | null;
  category: string;
  doctor: string;
  diagnosis?: string;
  department: string;
  room?: string;
  step: number;
  status: string;
  allergy?: string;
  chiefComplaint?: string;
  historyPresentIllness?: string;
  socialHistory?: {
    smoking?: string;
    alcohol?: string;
  };
  pastMedicalHistory?: {
    htn?: string;
    t2dm?: string;
    antiTB?: string;
  };
  specialist?: string;
  newOld: 'NEW' | 'OLD';
  description?: string;
  services?: {
    labo?: boolean;
    echo?: boolean;
    xray?: boolean;
    endo?: boolean;
    scan?: boolean;
    ecg?: boolean;
    kine?: boolean;
    vaccin?: boolean;
  };
  patient: number;
  hf: number;
}

export const visitsApi = {
  getAll: async (): Promise<Visit[]> => {
    try {
      const response = await axios.get(`${API_URL}/visits?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Visit | null> => {
    try {
      const response = await axios.get(`${API_URL}/visits/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching visit:', error);
      return null;
    }
  },

  create: async (visitData: CreateVisitData): Promise<Visit> => {
    try {
      const response = await axios.post(`${API_URL}/visits`, {
        data: visitData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  },

  update: async (id: number, visitData: Partial<CreateVisitData>): Promise<Visit> => {
    try {
      const response = await axios.put(`${API_URL}/visits/${id}`, {
        data: visitData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating visit:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/visits/${id}`);
    } catch (error) {
      console.error('Error deleting visit:', error);
      throw error;
    }
  },

  generateVisitNo: (prefix: string = 'VST'): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${random}`;
  }
};
import axios from 'axios';
import { Invoice } from './invoicesApi';
import { HealthFacility } from './healthFacilitiesApi';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface Claim {
  id: number;
  attributes: {
    claimID: string;
    claimType: 'Healthcare' | 'Insurance' | 'Other';
    claimDate: string;
    status: 'Draft' | 'Submited' | 'Approved' | 'Rejected' | 'Paid';
    amountClaimed: number;
    currency: 'KHR' | 'USD';
    createdAt: string;
    updatedAt: string;
    invoices: {
      data: Array<{
        id: number;
        attributes: {
          invoiceNo: string;
          Date: string;
          status: string | null;
          createdAt: string;
          updatedAt: string;
        };
      }>;
    };
    hf: {
      data: {
        id: number;
        attributes: {
          name: string;
          khmerName: string;
          createdAt: string;
          updatedAt: string;
          sign: boolean;
          p2: boolean;
          p3: boolean;
          nss: boolean;
          exchange: number;
          currency: 'KHR' | 'USD';
        };
      };
    };
  };
}

export interface CreateClaimData {
  claimID: string;
  claimType: 'Healthcare' | 'Insurance' | 'Other';
  claimDate: string;
  status: 'Draft' | 'Submited' | 'Approved' | 'Rejected' | 'Paid';
  amountClaimed: number;
  currency: 'KHR' | 'USD';
  invoices: number[]; // Array of invoice IDs
  hf: number; // Health facility ID
}

export const claimsApi = {
  getAll: async (): Promise<Claim[]> => {
    try {
      const response = await axios.get(`${API_URL}/claims?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Claim | null> => {
    try {
      const response = await axios.get(`${API_URL}/claims/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching claim:', error);
      return null;
    }
  },

  create: async (claimData: CreateClaimData): Promise<Claim> => {
    try {
      const response = await axios.post(`${API_URL}/claims`, {
        data: claimData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  },

  update: async (id: number, claimData: Partial<CreateClaimData>): Promise<Claim> => {
    try {
      const response = await axios.put(`${API_URL}/claims/${id}`, {
        data: claimData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/claims/${id}`);
    } catch (error) {
      console.error('Error deleting claim:', error);
      throw error;
    }
  },

  // Additional methods for specific claim operations
  submit: async (id: number): Promise<Claim> => {
    return claimsApi.update(id, { status: 'Submited' });
  },

  approve: async (id: number): Promise<Claim> => {
    return claimsApi.update(id, { status: 'Approved' });
  },

  reject: async (id: number): Promise<Claim> => {
    return claimsApi.update(id, { status: 'Rejected' });
  },

  markAsPaid: async (id: number): Promise<Claim> => {
    return claimsApi.update(id, { status: 'Paid' });
  },

  // Helper method to generate claim ID
  generateClaimId: (prefix: string = 'CLM'): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${year}${month}-${random}`;
  }
};
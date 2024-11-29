import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface InvoiceItem {
  id?: number;
  Description: string;
  qty: number;
  rate: number;
  disc?: number | null;
  disc2?: number | null;
  amt: number;
}

export interface InvoiceTotals {
  id?: number;
  USD: number;
  KHR: number;
}

export interface InvoiceAdm {
  id?: number;
  lock?: boolean | null;
  active: boolean;
  hf: string; // Added the 'hf' property to match the data structure
}

export interface Invoice {
  id?: number;
  attributes: {
    invoiceNo: string;
    Date: string;
    status: 'Paid' | 'Unpaid' | 'Partially Paid';
    items: InvoiceItem[];
    totals: InvoiceTotals;
    adm: InvoiceAdm[];
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreateInvoiceData {
  invoiceNo: string;
  Date: string;
  status: 'Paid' | 'Unpaid' | 'Partially Paid';
  items: Omit<InvoiceItem, 'id'>[];
  totals: Omit<InvoiceTotals, 'id'>;
  adm: Omit<InvoiceAdm, 'id'>[]; // 'hf' is included here via InvoiceAdm
}

export const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    try {
      const response = await axios.get(`${API_URL}/invoices?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },

  getById: async (id: number): Promise<Invoice | null> => {
    try {
      const response = await axios.get(`${API_URL}/invoices/${id}?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  },

  create: async (invoiceData: CreateInvoiceData): Promise<Invoice> => {
    try {
      const response = await axios.post(`${API_URL}/invoices`, {
        data: invoiceData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  update: async (id: number, invoiceData: Partial<CreateInvoiceData>): Promise<Invoice> => {
    try {
      const response = await axios.put(`${API_URL}/invoices/${id}`, {
        data: invoiceData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/invoices/${id}`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};

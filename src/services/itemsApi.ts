import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

export interface ItemCost {
  id?: number;
  USD: number;
  KHR: number;
}

export interface ItemPricelist {
  id?: string;
  group: string;
  price: number;
  discount: number | null;
}

export interface HealthFacility {
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
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface Item {
  id: number;
  attributes: {
    code: string;
    name: string;
    type: string;
    genericName?: string;
    expiry?: string;
    reorderLevel: number;
    stock: number;
    cost: ItemCost;
    pricelists: ItemPricelist[];
    hf: HealthFacility;
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateItemData {
  code: string;
  name: string;
  type: string;
  genericName?: string;
  expiry?: string;
  reorderLevel: number;
  stock: number;
  cost: Omit<ItemCost, 'id'>;
  pricelists: Omit<ItemPricelist, 'id'>[];
  hf: number;
}

export const itemsApi = {
  getAll: async (): Promise<Item[]> => {
    try {
      const response = await axios.get(`${API_URL}/items?populate=*`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      return [];
    }
  },

  create: async (itemData: CreateItemData): Promise<Item> => {
    try {
      // Ensure data is serializable by removing any potential Symbol values
      const serializedData = JSON.parse(JSON.stringify({
        data: itemData
      }));
      
      const response = await axios.post(`${API_URL}/items`, serializedData);
      return response.data.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  update: async (id: number, itemData: Partial<CreateItemData>): Promise<Item> => {
    try {
      // Ensure data is serializable by removing any potential Symbol values
      const serializedData = JSON.parse(JSON.stringify({
        data: itemData
      }));

      const response = await axios.put(`${API_URL}/items/${id}`, serializedData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/items/${id}`);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }
};
// staffApi.ts
import axios from 'axios';

const API_URL = 'https://strapi-186773-0.cloudclusters.net/api';

// Define interfaces for the staff data structures

export interface StaffContact {
  id?: number;
  phone: string | null;
  email: string | null;
  location: string | null;
}

export interface StaffRole {
  id: number;
  __component: 'meta.role';
  name: string;
}

export interface StaffPay {
  id: number;
  __component: 'finance.pay';
  baseSalary: number;
  caseBasedEarnings: number;
  bonuses: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
}

export interface Adm {
  id: number;
  lock: boolean;
  active: boolean;
}

export interface Department {
  id: number;
  name: string;
}

export interface StaffTitle {
  id: number;
  title: string;
}

export interface StaffAttributes {
  name: string;
  specialty: string;
  createdAt: string;
  updatedAt: string;
  contact: StaffContact;
  roles: StaffRole[];
  pays: StaffPay[];
  adm: Adm;
  department: Department[];
  title: StaffTitle;
}

export interface Staff {
  id: number;
  attributes: StaffAttributes;
}

export interface CreateStaffData {
  name: string;
  specialty: string;
  active?: boolean;
  contact?: StaffContact;
  roles?: Omit<StaffRole, 'id'>[];
  pays?: Omit<StaffPay, 'id'>[];
  adm?: Omit<Adm, 'id'>;
  department?: Omit<Department, 'id'>[];
  title: {
    title: string;
  };
}

export interface UpdateStaffData {
  name?: string;
  specialty?: string;
  active?: boolean;
  contact?: StaffContact;
  roles?: Omit<StaffRole, 'id'>[];
  pays?: Omit<StaffPay, 'id'>[];
  adm?: Partial<Omit<Adm, 'id'>>;
  department?: Omit<Department, 'id'>[];
  title?: {
    id?: number;
    title?: string;
  };
}

export const staffApi = {
  // Fetch all staff members
  getAll: async (): Promise<Staff[]> => {
    try {
      const response = await axios.get(`${API_URL}/staffs?populate=*`);
      return response.data.data as Staff[];
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch staff members.';
      console.error('Error fetching staff:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Fetch a staff member by ID
  getById: async (id: number): Promise<Staff | null> => {
    try {
      const response = await axios.get(`${API_URL}/staffs/${id}?populate=*`);
      return response.data.data as Staff;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to fetch staff member with ID ${id}.`;
      console.error('Error fetching staff member:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Create a new staff member
  create: async (staffData: CreateStaffData): Promise<Staff> => {
    try {
      // Log the data being sent
      console.log('Creating staff with data:', JSON.stringify(staffData, null, 2));

      // Prepare payload
      const payload: any = {
        data: {
          name: staffData.name,
          specialty: staffData.specialty,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contact: staffData.contact,
          roles: staffData.roles?.map(role => ({
            ...role,
          })),
          pays: staffData.pays?.map(pay => ({
            ...pay,
          })),
          adm: staffData.adm
            ? {
                ...staffData.adm,
              }
            : undefined,
          department: staffData.department?.map(dept => ({
            ...dept,
          })),
          title: {
            title: staffData.title.title,
          },
        },
      };

      // Log the serialized payload
      console.log('Serialized Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_URL}/staffs`, payload);

      // Log the response data
      console.log('API Response:', JSON.stringify(response.data, null, 2));

      return response.data.data as Staff;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create staff member.';
      console.error('Error creating staff member:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Update an existing staff member
  update: async (id: number, staffData: UpdateStaffData): Promise<Staff> => {
    try {
      // Log the data being sent
      console.log(`Updating staff with ID ${id} with data:`, JSON.stringify(staffData, null, 2));

      // Prepare updated data
      const updatedData: any = {
        ...staffData,
        updatedAt: new Date().toISOString(),
        title: staffData.title
          ? {
              ...(staffData.title.id && { id: staffData.title.id }),
              ...(staffData.title.title && { title: staffData.title.title }),
            }
          : undefined,
      };

      // Remove undefined fields
      Object.keys(updatedData).forEach(
        key => updatedData[key] === undefined && delete updatedData[key]
      );

      // Prepare payload
      const payload = {
        data: updatedData,
      };

      // Log the serialized payload
      console.log('Serialized Payload:', JSON.stringify(payload, null, 2));

      const response = await axios.put(`${API_URL}/staffs/${id}`, payload);

      // Log the response data
      console.log('API Response:', JSON.stringify(response.data, null, 2));

      return response.data.data as Staff;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to update staff member with ID ${id}.`;
      console.error('Error updating staff member:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Delete a staff member
  delete: async (id: number): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/staffs/${id}`);
      console.log(`Staff member with ID ${id} has been deleted.`);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to delete staff member with ID ${id}.`;
      console.error('Error deleting staff member:', errorMessage);
      throw new Error(errorMessage);
    }
  },
};

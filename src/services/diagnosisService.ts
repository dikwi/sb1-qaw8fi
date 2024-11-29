import diagnoses from '../data/diagnoses.json';

export interface Diagnosis {
  id: string;
  name: string;
  type: string;
}

export const diagnosisService = {
  search: async (searchTerm: string, page: number = 1, pageSize: number = 25) => {
    const filteredDiagnoses = diagnoses.diagnoses.filter(diagnosis => 
      diagnosis.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = filteredDiagnoses.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      meta: {
        pagination: {
          page,
          pageSize,
          pageCount: Math.ceil(filteredDiagnoses.length / pageSize),
          total: filteredDiagnoses.length
        }
      }
    };
  },

  getAll: async (): Promise<Diagnosis[]> => {
    return diagnoses.diagnoses;
  }
};
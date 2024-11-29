import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  fetchPatients,
  addPatient,
  updatePatient,
  deletePatient,
} from '../services/api';

export const usePatients = () => {
  const queryClient = useQueryClient();

  const {
    data: patients,
    isLoading,
    error,
  } = useQuery('patients', fetchPatients);

  const savePatient = useMutation(
    (patient) => (patient.id ? updatePatient(patient) : addPatient(patient)),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('patients');
      },
    }
  );

  const deletePatientMutation = useMutation(deletePatient, {
    onMutate: async (id) => {
      await queryClient.cancelQueries('patients');
      const previousPatients = queryClient.getQueryData('patients');

      queryClient.setQueryData('patients', (oldPatients: any) =>
        oldPatients?.filter((patient: any) => patient.id !== id)
      );

      return { previousPatients };
    },
    onError: (_, __, context) => {
      if (context?.previousPatients) {
        queryClient.setQueryData('patients', context.previousPatients);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries('patients');
    },
  });

  return {
    patients,
    isLoading,
    error,
    savePatient,
    deletePatient: deletePatientMutation,
  };
};

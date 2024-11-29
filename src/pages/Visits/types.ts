export interface Visit {
  id: number;
  attributes: {
    visitNo: string;
    patientName: string;
    category: string;
    dateIn: string;
    dateOut?: string;
    doctor: string;
    diagnosis: string;
    department: string;
    room: string;
    step: number;
    status: string;
    timeElapsed: string;
    favorite?: boolean;
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
  };
}
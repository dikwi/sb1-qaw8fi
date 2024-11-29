export interface Visit {
  id: number;
  date: string;
  healthFacility: string;
  caseType: string;
  diagnosis: string;
  queueNumber: number;
  note?: string;
}
import {
  fetchData,
  addData,
  updateData,
  deleteData,
} from './localStorageService';
import { mockPatients, mockDrugsAndServices, mockInvoices, mockUsers, mockReportData, mockStaff, mockSchedules, mockPayroll, mockClaims, mockInsurers, mockLabTests, mockImagingRequests, mockResults, mockHealthFacilities, mockItems, mockAttendance } from './mockData';

// Helper function to simulate API call delay
const mockApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500);
  });
};

// Add health facility context to all relevant API calls
const withFacilityContext = (data: any, facilityId: string) => {
  return {
    ...data,
    facilityId
  };
};

// Patients
export const fetchPatients = (facilityId?: string) => {
  const patients = mockApiCall(mockPatients);
  return facilityId ? patients.then(data => data.filter(p => p.facilityId === facilityId)) : patients;
};

export const addPatient = (patient: any) => {
  const newPatient = { ...patient, id: Date.now().toString() };
  return mockApiCall(newPatient);
};

export const updatePatient = (patient: any) => mockApiCall(patient);
export const deletePatient = (id: string) => mockApiCall({ success: true });

// Add this to the existing api.ts file
export const getNextQueueNumber = () => {
  const visits = fetchData('visits');
  const today = new Date().toISOString().split('T')[0];
  
  const todayVisits = visits.filter((visit: any) => 
    visit.dateIn.startsWith(today)
  );

  return todayVisits.length + 1;
};

// Visits
export const fetchVisits = (facilityId?: string) => {
  const visits = fetchData('visits');
  return facilityId ? visits.filter((visit: any) => visit.facilityId === facilityId) : visits;
};

export const addVisit = (visit: any) => addData('visits', visit);
export const updateVisit = (visit: any) => updateData('visits', visit);

// Lab Tests
export const fetchLabTests = (facilityId?: string) => {
  const labTests = fetchData('labTests');
  return facilityId ? labTests.filter((test: any) => test.facilityId === facilityId) : labTests;
};

export const addLabTest = (test: any) => addData('labTests', test);
export const updateLabTest = (test: any) => updateData('labTests', test);
export const updateLabTestBatch = ({ ids, action }: { ids: string[], action: string }) => {
  const labTests = fetchData('labTests');
  const updatedTests = labTests.map((test: any) => {
    if (ids.includes(test.id)) {
      return { ...test, status: action };
    }
    return test;
  });
  updatedTests.forEach((test: any) => updateData('labTests', test));
  return { success: true, message: `Updated ${ids.length} tests` };
};

// Medications
export const fetchMedications = (facilityId?: string) => {
  const medications = fetchData('medications');
  return facilityId ? medications.filter((med: any) => med.facilityId === facilityId) : medications;
};

export const addMedication = (medication: any) => addData('medications', medication);
export const updateMedication = (medication: any) => updateData('medications', medication);
export const deleteMedication = (id: string) => deleteData('medications', id);

// Prescriptions
export const fetchPrescriptions = (facilityId?: string) => {
  const prescriptions = fetchData('prescriptions');
  return facilityId ? prescriptions.filter((presc: any) => presc.facilityId === facilityId) : prescriptions;
};

export const updatePrescription = (prescription: any) => updateData('prescriptions', prescription);

// Invoices
export const fetchInvoices = (facilityId?: string) => {
  const invoices = mockApiCall(mockInvoices);
  return facilityId ? invoices.then(data => data.filter(inv => inv.facilityId === facilityId)) : invoices;
};

export const addInvoice = (invoice: any) => {
  const newInvoice = { ...invoice, id: Date.now().toString() };
  return mockApiCall(newInvoice);
};

export const updateInvoice = (invoice: any) => mockApiCall(invoice);

// Users
export const fetchUsers = (facilityId?: string) => {
  const users = mockApiCall(mockUsers);
  return facilityId ? users.then(data => data.filter(user => user.facilityId === facilityId)) : users;
};

export const addUser = (user: any) => {
  const newUser = { ...user, id: Date.now().toString() };
  return mockApiCall(newUser);
};

export const updateUser = (user: any) => mockApiCall(user);

// Doctors (for appointments)
export const fetchDoctors = (facilityId?: string) => {
  const users = fetchData('users');
  const doctors = users.filter((user: any) => user.role === 'Doctor');
  return facilityId ? doctors.filter((doc: any) => doc.facilityId === facilityId) : doctors;
};

// Health Facilities
export const fetchHealthFacilities = () => mockApiCall(mockHealthFacilities);
export const addHealthFacility = (facility: any) => {
  const newFacility = { ...facility, id: mockHealthFacilities.length + 1 };
  mockHealthFacilities.push(newFacility);
  return mockApiCall(newFacility);
};

export const updateHealthFacility = (facility: any) => {
  const index = mockHealthFacilities.findIndex(f => f.id === facility.id);
  if (index !== -1) {
    mockHealthFacilities[index] = { ...mockHealthFacilities[index], ...facility };
    return mockApiCall(mockHealthFacilities[index]);
  }
  throw new Error('Health facility not found');
};

export const deleteHealthFacility = (id: number) => {
  const index = mockHealthFacilities.findIndex(f => f.id === id);
  if (index !== -1) {
    const deletedFacility = mockHealthFacilities.splice(index, 1)[0];
    return mockApiCall(deletedFacility);
  }
  throw new Error('Health facility not found');
};

// Items
export const fetchItems = (facilityId?: string) => {
  const items = mockApiCall(mockItems);
  return facilityId ? items.then(data => data.filter(item => item.facilityId === facilityId)) : items;
};

export const addItem = (item: any) => {
  const newItem = { ...item, id: mockItems.length + 1 };
  mockItems.push(newItem);
  return mockApiCall(newItem);
};

export const updateItem = (item: any) => {
  const index = mockItems.findIndex(i => i.id === item.id);
  if (index !== -1) {
    mockItems[index] = { ...mockItems[index], ...item };
    return mockApiCall(mockItems[index]);
  }
  throw new Error('Item not found');
};

export const deleteItem = (id: number) => {
  const index = mockItems.findIndex(i => i.id === id);
  if (index !== -1) {
    const deletedItem = mockItems.splice(index, 1)[0];
    return mockApiCall(deletedItem);
  }
  throw new Error('Item not found');
};

// Attendance
export const fetchAttendance = (facilityId?: string) => {
  const attendance = mockApiCall(mockAttendance);
  return facilityId ? attendance.then(data => data.filter(att => att.facilityId === facilityId)) : attendance;
};

export const addAttendance = (attendance: any) => {
  const newAttendance = { ...attendance, id: Date.now().toString() };
  mockAttendance.push(newAttendance);
  return mockApiCall(newAttendance);
};

// Import Attendance
export const importAttendance = (attendanceData: any[]) => {
  attendanceData.forEach(record => {
    const newAttendance = { ...record, id: Date.now().toString() };
    mockAttendance.push(newAttendance);
  });
  return mockApiCall({ success: true, importedCount: attendanceData.length });
};

// Pharmacy Reports
export const fetchPharmacyReports = (reportType: 'sales' | 'inventory' | 'expiry', facilityId?: string) => {
  const mockReportData = {
    sales: [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 5000 },
    ],
    inventory: [
      { name: 'Medication A', value: 100 },
      { name: 'Medication B', value: 200 },
      { name: 'Medication C', value: 150 },
    ],
    expiry: [
      { name: 'This Month', value: 10 },
      { name: 'Next Month', value: 20 },
      { name: 'In 3 Months', value: 30 },
    ],
  };

  const data = mockApiCall(mockReportData[reportType]);
  return facilityId ? data.then(d => ({ ...d, facilityId })) : data;
};

// Claims
export const fetchClaims = (facilityId?: string) => {
  const claims = mockApiCall(mockClaims);
  return facilityId ? claims.then(data => data.filter(claim => claim.facilityId === facilityId)) : claims;
};

export const submitClaim = (claim: any) => {
  const newClaim = { ...claim, id: Date.now().toString(), status: 'Pending' };
  mockClaims.push(newClaim);
  return mockApiCall(newClaim);
};

export const updateClaimStatus = ({ claimId, status }: { claimId: string; status: string }) => {
  const index = mockClaims.findIndex(c => c.id === claimId);
  if (index !== -1) {
    mockClaims[index] = { ...mockClaims[index], status };
    return mockApiCall(mockClaims[index]);
  }
  throw new Error('Claim not found');
};

// Insurers
export const fetchInsurers = (facilityId?: string) => {
  const insurers = mockApiCall(mockInsurers);
  return facilityId ? insurers.then(data => data.filter(ins => ins.facilityId === facilityId)) : insurers;
};

// Unpaid Claims
export const fetchUnpaidClaims = (facilityId?: string) => {
  const claims = mockApiCall(mockClaims.filter(claim => claim.status !== 'Paid'));
  return facilityId ? claims.then(data => data.filter(claim => claim.facilityId === facilityId)) : claims;
};

// Payment Reconciliation
export const reconcilePayment = ({ claimIds, amount }: { claimIds: string[]; amount: number }) => {
  claimIds.forEach(id => {
    const claim = mockClaims.find(c => c.id === id);
    if (claim) {
      claim.status = 'Paid';
    }
  });
  return mockApiCall({ success: true });
};

export const fetchLaboItems = (facilityId?: string) => {
  const items = mockApiCall(mockItems.filter(item => item.type === 'Labo'));
  return facilityId ? items.then(data => data.filter(item => item.facilityId === facilityId)) : items;
};

// Dashboard
export const fetchDashboardData = (timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly') => mockApiCall(mockDashboardData[timeFrame]);

// Drugs and Services
export const fetchDrugsAndServices = () => mockApiCall(mockDrugsAndServices);
export const addDrug = (drug: any) => {
  const newDrug = { ...drug, id: mockDrugsAndServices.drugs.length + 1 };
  mockDrugsAndServices.drugs.push(newDrug);
  return mockApiCall(newDrug);
};
export const updateDrug = (drug: any) => {
  const index = mockDrugsAndServices.drugs.findIndex(d => d.id === drug.id);
  if (index !== -1) {
    mockDrugsAndServices.drugs[index] = { ...mockDrugsAndServices.drugs[index], ...drug };
    return mockApiCall(mockDrugsAndServices.drugs[index]);
  }
  throw new Error('Drug not found');
};
export const updateDrugStock = (data: { drugId: number; action: 'in' | 'out'; quantity: number; prescriptionId?: string; note?: string }) => {
  const drug = mockDrugsAndServices.drugs.find(d => d.id === data.drugId);
  if (drug) {
    if (data.action === 'in') {
      drug.stock += data.quantity;
    } else {
      drug.stock -= data.quantity;
    }
    return mockApiCall(drug);
  }
  throw new Error('Drug not found');
};

// Staff
export const fetchStaff = () => mockApiCall(mockStaff);
export const addStaff = (staffMember: any) => {
  const newStaffMember = { ...staffMember, id: mockStaff.length + 1 };
  mockStaff.push(newStaffMember);
  return mockApiCall(newStaffMember);
};
export const updateStaff = (staffMember: any) => {
  const index = mockStaff.findIndex(s => s.id === staffMember.id);
  if (index !== -1) {
    mockStaff[index] = { ...mockStaff[index], ...staffMember };
    return mockApiCall(mockStaff[index]);
  }
  throw new Error('Staff member not found');
};
export const deleteStaff = (id: number) => {
  const index = mockStaff.findIndex(s => s.id === id);
  if (index !== -1) {
    const deletedStaff = mockStaff.splice(index, 1)[0];
    return mockApiCall(deletedStaff);
  }
  throw new Error('Staff member not found');
};

// Schedules
export const fetchSchedules = () => mockApiCall(mockSchedules);
export const addSchedule = (schedule: any) => {
  const newSchedule = { ...schedule, id: mockSchedules.length + 1 };
  mockSchedules.push(newSchedule);
  return mockApiCall(newSchedule);
};

// Payroll
export const fetchPayroll = () => mockApiCall(mockPayroll);
export const processPayroll = (payrollData: any) => {
  const newPayroll = { ...payrollData, id: mockPayroll.length + 1, processedDate: new Date().toISOString() };
  mockPayroll.push(newPayroll);
  return mockApiCall(newPayroll);
};
export const fetchReportData = () => mockApiCall(mockReportData);

// Appointments
export const fetchAppointments = () => mockApiCall(mockAppointments);
export const addAppointment = (appointment: any) => {
  const newAppointment = { ...appointment, id: Date.now().toString() };
  appointments.push(newAppointment);
  return mockApiCall(newAppointment);
};
export const updateAppointment = (appointment: any) => {
  return mockApiCall(appointment);
};
export const deleteAppointment = (id: string) => {
  return mockApiCall({ success: true });
};

// Imaging Requests
export const fetchImagingRequests = () => mockApiCall(mockImagingRequests);
export const addImagingRequest = (request: any) => {
  const newRequest = { ...request, id: Date.now().toString() };
  mockImagingRequests.push(newRequest);
  return mockApiCall(newRequest);
};
export const updateImagingRequest = (request: any) => {
  const index = mockImagingRequests.findIndex(r => r.id === request.id);
  if (index !== -1) {
    mockImagingRequests[index] = { ...mockImagingRequests[index], ...request };
    return mockApiCall(mockImagingRequests[index]);
  }
  throw new Error('Imaging request not found');
};

// Results
export const fetchResults = () => mockApiCall(mockResults);

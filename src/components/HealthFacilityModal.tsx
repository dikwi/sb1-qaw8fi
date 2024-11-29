import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { HealthFacility, CreateHealthFacilityData } from '../services/healthFacilitiesApi';

interface HealthFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facility: CreateHealthFacilityData) => void;
  facility?: HealthFacility | null;
}

const defaultFormData: CreateHealthFacilityData = {
  name: '',
  khmerName: '',
  sign: false,
  p2: false,
  p3: false,
  nss: false,
  currency: 'KHR',
  exchange: 4000,
  Contact: {
    Phone: '',
    Email: '',
    Location: ''
  },
  rooms: [],
  beds: [],
  departments: []
};

const tabs = [
  { name: 'Basic Information', id: 'basic' },
  { name: 'Contact Information', id: 'contact' },
  { name: 'Settings', id: 'settings' },
  { name: 'Rooms', id: 'rooms' },
  { name: 'Beds', id: 'beds' },
  { name: 'Departments', id: 'departments' },
];

const HealthFacilityModal: React.FC<HealthFacilityModalProps> = ({ isOpen, onClose, onSubmit, facility }) => {
  const [formData, setFormData] = useState<CreateHealthFacilityData>(defaultFormData);
  const [activeTab, setActiveTab] = useState<string>('basic');

  // States for managing Rooms
  const [roomData, setRoomData] = useState<any>({
    name: '',
    building: '',
    floor: '',
    type: '',
    hasAircon: false,
  });
  const [showAddRoomForm, setShowAddRoomForm] = useState<boolean>(false);
  const [editRoomId, setEditRoomId] = useState<number | null>(null);

  // States for managing Beds
  const [bedData, setBedData] = useState<any>({
    roomId: '',
    bedNumber: '',
    type: '',
  });
  const [showAddBedForm, setShowAddBedForm] = useState<boolean>(false);
  const [editBedId, setEditBedId] = useState<number | null>(null);

  // States for managing Departments
  const [departmentData, setDepartmentData] = useState<any>({
    name: '',
  });
  const [showAddDepartmentForm, setShowAddDepartmentForm] = useState<boolean>(false);
  const [editDepartmentId, setEditDepartmentId] = useState<number | null>(null);

  useEffect(() => {
    if (facility) {
      setFormData({
        name: facility.attributes.name || '',
        khmerName: facility.attributes.khmerName || '',
        sign: facility.attributes.sign ?? false,
        p2: facility.attributes.p2 ?? false,
        p3: facility.attributes.p3 ?? false,
        nss: facility.attributes.nss ?? false,
        exchange: facility.attributes.exchange ?? 4000,
        Contact: {
          Phone: facility.attributes.Contact?.phone || '',
          Email: facility.attributes.Contact?.email || '',
          Location: facility.attributes.Contact?.location || '',
        },
        rooms: facility.attributes.rooms || [],
        beds: facility.attributes.beds || [], // Assuming beds data exists
        departments: facility.attributes.departments || [], // Assuming departments data exists
      });
    } else {
      setFormData(defaultFormData);
    }
    setActiveTab('basic'); // Reset to first tab on open
    // Reset all forms when modal opens/closes
    setShowAddRoomForm(false);
    setEditRoomId(null);
    setShowAddBedForm(false);
    setEditBedId(null);
    setShowAddDepartmentForm(false);
    setEditDepartmentId(null);
  }, [facility, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || ''
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      Contact: {
        ...prev.Contact,
        [name]: value || ''
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      exchange: formData.exchange ? Number(formData.exchange) : null,
      Contact: {
        Phone: formData.Contact.Phone || null,
        Email: formData.Contact.Email || null,
        Location: formData.Contact.Location || null,
      }
    };
    onSubmit(submitData);
    onClose(); // Close modal after submission
  };

  // Handlers for Rooms
  const addRoom = () => {
    setFormData(prev => ({
      ...prev,
      rooms: [
        ...prev.rooms,
        { ...roomData, id: Date.now() } // Assign a unique ID
      ]
    }));
    setRoomData({ name: '', building: '', floor: '', type: '', hasAircon: false });
    setShowAddRoomForm(false);
  };

  const updateRoom = () => {
    if (editRoomId !== null) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.map(room => room.id === editRoomId ? { ...room, ...roomData } : room)
      }));
      setRoomData({ name: '', building: '', floor: '', type: '', hasAircon: false });
      setEditRoomId(null);
    }
  };

  const deleteRoom = (id: number) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      setFormData(prev => ({
        ...prev,
        rooms: prev.rooms.filter(room => room.id !== id)
      }));
    }
  };

  const initiateEditRoom = (room: any) => {
    setRoomData({
      name: room.name,
      building: room.building,
      floor: room.floor,
      type: room.type,
      hasAircon: room.hasAircon,
    });
    setEditRoomId(room.id);
    setActiveTab('rooms'); // Ensure user is on Rooms tab
    setShowAddRoomForm(false); // Hide add form if visible
  };

  // Handlers for Beds
  const addBed = () => {
    setFormData(prev => ({
      ...prev,
      beds: [
        ...prev.beds,
        { ...bedData, id: Date.now() }
      ]
    }));
    setBedData({ roomId: '', bedNumber: '', type: '' });
    setShowAddBedForm(false);
  };

  const updateBed = () => {
    if (editBedId !== null) {
      setFormData(prev => ({
        ...prev,
        beds: prev.beds.map(bed => bed.id === editBedId ? { ...bed, ...bedData } : bed)
      }));
      setBedData({ roomId: '', bedNumber: '', type: '' });
      setEditBedId(null);
    }
  };

  const deleteBed = (id: number) => {
    if (window.confirm('Are you sure you want to delete this bed?')) {
      setFormData(prev => ({
        ...prev,
        beds: prev.beds.filter(bed => bed.id !== id)
      }));
    }
  };

  const initiateEditBed = (bed: any) => {
    setBedData({
      roomId: bed.roomId,
      bedNumber: bed.bedNumber,
      type: bed.type,
    });
    setEditBedId(bed.id);
    setActiveTab('beds'); // Ensure user is on Beds tab
    setShowAddBedForm(false); // Hide add form if visible
  };

  // Handlers for Departments
  const addDepartment = () => {
    setFormData(prev => ({
      ...prev,
      departments: [
        ...prev.departments,
        { ...departmentData, id: Date.now() }
      ]
    }));
    setDepartmentData({ name: '' });
    setShowAddDepartmentForm(false);
  };

  const updateDepartment = () => {
    if (editDepartmentId !== null) {
      setFormData(prev => ({
        ...prev,
        departments: prev.departments.map(dept => dept.id === editDepartmentId ? { ...dept, ...departmentData } : dept)
      }));
      setDepartmentData({ name: '' });
      setEditDepartmentId(null);
    }
  };

  const deleteDepartment = (id: number) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setFormData(prev => ({
        ...prev,
        departments: prev.departments.filter(dept => dept.id !== id)
      }));
    }
  };

  const initiateEditDepartment = (dept: any) => {
    setDepartmentData({
      name: dept.name,
    });
    setEditDepartmentId(dept.id);
    setActiveTab('departments'); // Ensure user is on Departments tab
    setShowAddDepartmentForm(false); // Hide add form if visible
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 my-8 shadow-lg flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold" id="modal-title">
            {facility ? 'Edit Health Facility' : 'Add Health Facility'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm focus:outline-none ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto" id="healthFacilityForm">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="khmerName" className="block text-sm font-medium text-gray-700">
                    Khmer Name
                  </label>
                  <input
                    type="text"
                    name="khmerName"
                    id="khmerName"
                    value={formData.khmerName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="Phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="Phone"
                    id="Phone"
                    value={formData.Contact.Phone || ''}
                    onChange={handleContactChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div>
                  <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="Email"
                    id="Email"
                    value={formData.Contact.Email || ''}
                    onChange={handleContactChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="Location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    name="Location"
                    id="Location"
                    value={formData.Contact.Location || ''}
                    onChange={handleContactChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Currency Selection */}
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <select
                    name="currency"
                    id="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  >
                    <option value="KHR">KHR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
          
                {/* Exchange Rate */}
                <div>
                  <label htmlFor="exchange" className="block text-sm font-medium text-gray-700">
                    Exchange Rate
                  </label>
                  <input
                    type="number"
                    name="exchange"
                    id="exchange"
                    value={formData.exchange || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
          
              <div className="grid grid-cols-2 gap-4">
                {/* Sign Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="sign"
                    checked={formData.sign || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">Sign</span>
                </label>
          
                {/* P2 Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="p2"
                    checked={formData.p2 || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">P2</span>
                </label>
          
                {/* P3 Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="p3"
                    checked={formData.p3 || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">P3</span>
                </label>
          
                {/* NSS Checkbox */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="nss"
                    checked={formData.nss || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">NSS</span>
                </label>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Add/Edit Room Form */}
              {showAddRoomForm || editRoomId !== null ? (
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {editRoomId !== null ? 'Edit Room' : 'Add Room'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                        Room Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="roomName"
                        value={roomData.name}
                        onChange={(e) => setRoomData({ ...roomData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="building" className="block text-sm font-medium text-gray-700">
                        Building
                      </label>
                      <input
                        type="text"
                        name="building"
                        id="building"
                        value={roomData.building}
                        onChange={(e) => setRoomData({ ...roomData, building: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                        Floor
                      </label>
                      <input
                        type="text"
                        name="floor"
                        id="floor"
                        value={roomData.floor}
                        onChange={(e) => setRoomData({ ...roomData, floor: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        name="type"
                        id="type"
                        value={roomData.type}
                        onChange={(e) => setRoomData({ ...roomData, type: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="VIP">VIP</option>
                        <option value="Standard">Standard</option>
                        <option value="ICU">ICU</option>
                        {/* Add more options as needed */}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="hasAircon"
                          checked={roomData.hasAircon}
                          onChange={(e) => setRoomData({ ...roomData, hasAircon: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                        <span className="text-sm text-gray-700">Has Air Conditioning</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddRoomForm(false);
                        setEditRoomId(null);
                        setRoomData({ name: '', building: '', floor: '', type: '', hasAircon: false });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editRoomId !== null ? updateRoom : addRoom}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      {editRoomId !== null ? 'Update Room' : 'Add Room'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Add Room Button */}
              {!showAddRoomForm && editRoomId === null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddRoomForm(true);
                      setRoomData({ name: '', building: '', floor: '', type: '', hasAircon: false });
                      setEditRoomId(null);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Room
                  </button>
                </div>
              )}

              {/* Rooms List */}
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Rooms</h3>
                {formData.rooms.length === 0 ? (
                  <p className="text-gray-500">No rooms added yet.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircon</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.rooms.map((room) => (
                        <tr key={room.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{room.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{room.building}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{room.floor}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{room.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{room.hasAircon ? 'Yes' : 'No'}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                            <button
                              type="button"
                              onClick={() => initiateEditRoom(room)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoom(room.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Beds Tab */}
          {activeTab === 'beds' && (
            <div className="space-y-6">
              {/* Add/Edit Bed Form */}
              {showAddBedForm || editBedId !== null ? (
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {editBedId !== null ? 'Edit Bed' : 'Add Bed'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="bedRoom" className="block text-sm font-medium text-gray-700">
                        Room
                      </label>
                      <select
                        name="roomId"
                        id="bedRoom"
                        value={bedData.roomId}
                        onChange={(e) => setBedData({ ...bedData, roomId: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      >
                        <option value="">Select Room</option>
                        {formData.rooms.map(room => (
                          <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="bedNumber" className="block text-sm font-medium text-gray-700">
                        Bed Number
                      </label>
                      <input
                        type="text"
                        name="bedNumber"
                        id="bedNumber"
                        value={bedData.bedNumber}
                        onChange={(e) => setBedData({ ...bedData, bedNumber: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="bedType" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <select
                        name="type"
                        id="bedType"
                        value={bedData.type}
                        onChange={(e) => setBedData({ ...bedData, type: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Standard">Standard</option>
                        <option value="ICU">ICU</option>
                        <option value="Ventilator">Ventilator</option>
                        {/* Add more options as needed */}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBedForm(false);
                        setEditBedId(null);
                        setBedData({ roomId: '', bedNumber: '', type: '' });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editBedId !== null ? updateBed : addBed}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      {editBedId !== null ? 'Update Bed' : 'Add Bed'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Add Bed Button */}
              {!showAddBedForm && editBedId === null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddBedForm(true);
                      setBedData({ roomId: '', bedNumber: '', type: '' });
                      setEditBedId(null);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Bed
                  </button>
                </div>
              )}

              {/* Beds List */}
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Beds</h3>
                {formData.beds.length === 0 ? (
                  <p className="text-gray-500">No beds added yet.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bed Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.beds.map((bed) => (
                        <tr key={bed.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formData.rooms.find(room => room.id === parseInt(bed.roomId))?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{bed.bedNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{bed.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                            <button
                              type="button"
                              onClick={() => initiateEditBed(bed)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBed(bed.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Departments Tab */}
          {activeTab === 'departments' && (
            <div className="space-y-6">
              {/* Add/Edit Department Form */}
              {showAddDepartmentForm || editDepartmentId !== null ? (
                <div className="p-4 border rounded-md">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">
                    {editDepartmentId !== null ? 'Edit Department' : 'Add Department'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="departmentName" className="block text-sm font-medium text-gray-700">
                        Department Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="departmentName"
                        value={departmentData.name}
                        onChange={(e) => setDepartmentData({ ...departmentData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddDepartmentForm(false);
                        setEditDepartmentId(null);
                        setDepartmentData({ name: '' });
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={editDepartmentId !== null ? updateDepartment : addDepartment}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      {editDepartmentId !== null ? 'Update Department' : 'Add Department'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Add Department Button */}
              {!showAddDepartmentForm && editDepartmentId === null && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDepartmentForm(true);
                      setDepartmentData({ name: '' });
                      setEditDepartmentId(null);
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Add Department
                  </button>
                </div>
              )}

              {/* Departments List */}
              <div className="p-4 border rounded-md">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Departments</h3>
                {formData.departments.length === 0 ? (
                  <p className="text-gray-500">No departments added yet.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.departments.map((dept) => (
                        <tr key={dept.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{dept.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex space-x-4">
                            <button
                              type="button"
                              onClick={() => initiateEditDepartment(dept)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDepartment(dept.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </form>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            form="healthFacilityForm"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            {facility ? 'Update Facility' : 'Add Facility'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthFacilityModal;

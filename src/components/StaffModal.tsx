// StaffModal.tsx
import React, { useState, useEffect, Fragment } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { Tab } from '@headlessui/react';
import { Staff, CreateStaffData, StaffPay } from '../services/staffApi';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (staff: CreateStaffData) => void;
  staff?: Staff | null;
}

const defaultFormData: CreateStaffData = {
  name: '',
  specialty: '',
  active: true,
  contact: {
    phone: '',
    email: '',
    location: '',
  },
  roles: [],
  pays: [],
  adm: {
    lock: false,
    active: true,
  },
  department: [],
  title: {
    title: '',
  },
};

const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onSubmit, staff }) => {
  const [formData, setFormData] = useState<CreateStaffData>(defaultFormData);

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.attributes.name || '',
        specialty: staff.attributes.specialty || '',
        active: staff.attributes.adm?.active ?? true,
        contact: staff.attributes.contact || { phone: '', email: '', location: '' },
        roles: staff.attributes.roles?.map(role => ({
          __component: role.__component,
          name: role.name,
        })) || [],
        pays: staff.attributes.pays?.map(pay => ({
          __component: pay.__component,
          baseSalary: pay.baseSalary,
          caseBasedEarnings: pay.caseBasedEarnings,
          bonuses: pay.bonuses,
          employmentType: pay.employmentType,
        })) || [],
        adm: {
          lock: staff.attributes.adm?.lock ?? false,
          active: staff.attributes.adm?.active ?? true,
        },
        department: staff.attributes.department?.map(dept => ({
          name: dept.name,
        })) || [],
        title: {
          title: staff.attributes.title?.title || '',
        },
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [staff]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      if (name.includes('.')) {
        const [section, field] = name.split('.');
        if (section === 'contact') {
          return {
            ...prev,
            contact: {
              ...prev.contact,
              [field]: value,
            },
          };
        } else if (section === 'adm') {
          return {
            ...prev,
            adm: {
              ...prev.adm,
              [field]: type === 'checkbox' ? checked : value,
            },
          };
        } else if (section === 'title') {
          return {
            ...prev,
            title: {
              ...prev.title,
              [field]: value,
            },
          };
        }
      }
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });
  };

  // Handlers for Roles
  const handleAddRole = () => {
    setFormData(prev => ({
      ...prev,
      roles: [
        ...(prev.roles || []),
        { __component: 'meta.role', name: '' },
      ],
    }));
  };

  const handleRemoveRole = (index: number) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleRoleChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles?.map((role, i) =>
        i === index ? { ...role, name: value } : role
      ) || [],
    }));
  };

  // Handlers for Pay
  const handleAddPay = () => {
    setFormData(prev => ({
      ...prev,
      pays: [
        ...(prev.pays || []),
        { __component: 'finance.pay', baseSalary: 0, caseBasedEarnings: 0, bonuses: 0, employmentType: 'Full-time' },
      ],
    }));
  };

  const handlePayChange = (
    index: number, 
    field: keyof Omit<StaffPay, 'id' | '__component'>, 
    value: number | string
  ) => {
    setFormData(prev => ({
      ...prev,
      pays: prev.pays?.map((pay, i) => 
        i === index ? { ...pay, [field]: value } : pay
      ) || [],
    }));
  };

  const handleRemovePay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pays: prev.pays?.filter((_, i) => i !== index) || [],
    }));
  };

  // Handlers for Department
  const handleAddDepartment = () => {
    setFormData(prev => ({
      ...prev,
      department: [
        ...(prev.department || []),
        { name: '' },
      ],
    }));
  };

  const handleRemoveDepartment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      department: prev.department?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleDepartmentChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      department: prev.department?.map((dept, i) =>
        i === index ? { name: value } : dept
      ) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-3xl my-8 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1 mb-6">
              {['Basic Info', 'Contact', 'Roles', 'Pay', 'Department'].map((tab) => (
                <Tab as={Fragment} key={tab}>
                  {({ selected }) => (
                    <button
                      className={`w-full py-2.5 text-sm leading-5 font-medium text-blue-700 rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                        ${selected
                          ? 'bg-white shadow'
                          : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                        }`}
                    >
                      {tab}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {/* Basic Info */}
              <Tab.Panel>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="title.title" className="block text-sm font-medium text-gray-700">
                      Title<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title.title"
                      name="title.title"
                      value={formData.title.title}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      placeholder="e.g., Dr., Mr., Ms."
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                      Specialty<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                </div>

                {/* Active and Lock Checkboxes */}
                <div className="mt-6 space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="adm.lock"
                      checked={formData.adm.lock}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm text-gray-700">Lock</span>
                  </label>
                </div>
              </Tab.Panel>

              {/* Contact */}
              <Tab.Panel>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="contact.phone"
                      name="contact.phone"
                      value={formData.contact?.phone || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="contact.email"
                      name="contact.email"
                      value={formData.contact?.email || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="contact.location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="contact.location"
                      name="contact.location"
                      value={formData.contact?.location || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                  </div>
                </div>
              </Tab.Panel>

              {/* Roles */}
              <Tab.Panel>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Roles</h3>
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={20} className="mr-1" /> Add Role
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.roles?.map((role, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={role.name}
                        onChange={(e) => handleRoleChange(index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Role name"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRole(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove role"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.roles.length === 0 && (
                    <p className="text-gray-500">No roles added yet.</p>
                  )}
                </div>
              </Tab.Panel>

              {/* Pay */}
              <Tab.Panel>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Pay Information</h3>
                  <button
                    type="button"
                    onClick={handleAddPay}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={20} className="mr-1" /> Add Pay Structure
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.pays?.map((pay, index) => (
                    <div key={index} className="border p-4 rounded-md bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Pay Structure {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => handleRemovePay(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Remove pay structure"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Base Salary</label>
                          <input
                            type="number"
                            min="0"
                            name={`pays.${index}.baseSalary`}
                            value={pay.baseSalary}
                            onChange={(e) => handlePayChange(index, 'baseSalary', parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Case Based Earnings</label>
                          <input
                            type="number"
                            min="0"
                            name={`pays.${index}.caseBasedEarnings`}
                            value={pay.caseBasedEarnings}
                            onChange={(e) => handlePayChange(index, 'caseBasedEarnings', parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bonuses</label>
                          <input
                            type="number"
                            min="0"
                            name={`pays.${index}.bonuses`}
                            value={pay.bonuses}
                            onChange={(e) => handlePayChange(index, 'bonuses', parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                          <select
                            name={`pays.${index}.employmentType`}
                            value={pay.employmentType}
                            onChange={(e) => handlePayChange(index, 'employmentType', e.target.value as 'Full-time' | 'Part-time' | 'Contract')}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            required
                          >
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.pays.length === 0 && (
                    <p className="text-gray-500">No pay structures added yet.</p>
                  )}
                </div>
              </Tab.Panel>

              {/* Department */}
              <Tab.Panel>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Departments</h3>
                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    className="flex items-center text-blue-500 hover:text-blue-700"
                  >
                    <Plus size={20} className="mr-1" /> Add Department
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.department?.map((dept, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => handleDepartmentChange(index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        placeholder="Department name"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDepartment(index)}
                        className="text-red-500 hover:text-red-700"
                        aria-label="Remove department"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.department.length === 0 && (
                    <p className="text-gray-500">No departments added yet.</p>
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          {/* Submit and Cancel Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              {staff ? 'Update Staff Member' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;

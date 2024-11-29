import React, { useState, useEffect } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import { Item, CreateItemData, Pricelist } from '../services/itemsApi';
import { useHealthFacility } from '../contexts/HealthFacilityContext';
import { v4 as uuidv4 } from 'uuid'; // Ensure this is installed

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CreateItemData) => void;
  item?: Item | null;
  defaultType?: string;
}

const TABS = ['Basic Information', 'Cost Details', 'Pricelist Packages'] as const;
type Tab = typeof TABS[number];

const GROUP_OPTIONS = [
  'General',
  'NSSF',
  'Resident',
  'Expat',
  'Tourist',
  'InsuranceA',
  'InsuranceB',
];

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  defaultType,
}) => {
  const { currentFacility } = useHealthFacility();
  const [activeTab, setActiveTab] = useState<Tab>('Basic Information');
  const [formData, setFormData] = useState<CreateItemData>({
    code: '',
    name: '',
    type: defaultType || '',
    genericName: '',
    expiry: '',
    reorderLevel: 10,
    stock: 0,
    cost: {
      USD: 0,
      KHR: 0,
    },
    pricelists: [
      { id: uuidv4(), group: 'General', price: 0, discount: 0 },
      { id: uuidv4(), group: 'NSSF', price: 0, discount: null },
    ],
    hf: currentFacility?.id || 1,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        code: item.attributes.code,
        name: item.attributes.name,
        type: item.attributes.type,
        genericName: item.attributes.genericName,
        expiry: item.attributes.expiry,
        reorderLevel: item.attributes.reorderLevel,
        stock: item.attributes.stock,
        cost: {
          USD: item.attributes.cost.USD,
          KHR: item.attributes.cost.KHR,
        },
        pricelists: item.attributes.pricelists.map((pl) => ({
          id: uuidv4(),
          group: pl.group,
          price: pl.price,
          discount: pl.discount,
        })),
        hf: item.attributes.hf.data.id,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        type: defaultType || '',
        hf: currentFacility?.id || 1,
      }));
    }
  }, [item, defaultType, currentFacility]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCostChange = (currency: 'USD' | 'KHR', value: string) => {
    setFormData((prev) => ({
      ...prev,
      cost: {
        ...prev.cost,
        [currency]: parseFloat(value) || 0,
      },
    }));
  };

  const handlePricelistChange = (
    id: string,
    field: 'price' | 'discount' | 'group',
    value: string
  ) => {
    const newPricelists = formData.pricelists.map((pl) => {
      if (pl.id === id) {
        return {
          ...pl,
          [field]:
            field === 'price' || field === 'discount'
              ? value === ''
                ? field === 'discount'
                  ? null
                  : 0
                : parseFloat(value)
              : value,
        };
      }
      return pl;
    });
    setFormData((prev) => ({ ...prev, pricelists: newPricelists }));
  };

  const addPricelist = () => {
    const availableGroups = GROUP_OPTIONS.filter(
      (group) => !formData.pricelists.some((pl) => pl.group === group)
    );

    if (availableGroups.length === 0) {
      alert('All group options have been added.');
      return;
    }

    const newPricelist: Pricelist = {
      id: uuidv4(),
      group: availableGroups[0], // Default to the first available group
      price: 0,
      discount: null,
    };
    setFormData((prev) => ({
      ...prev,
      pricelists: [...prev.pricelists, newPricelist],
    }));
    setActiveTab('Pricelist Packages'); // Switch to Pricelist tab to show the new entry
  };

  const deletePricelist = (id: string) => {
    const pricelist = formData.pricelists.find((pl) => pl.id === id);
    if (
      pricelist &&
      window.confirm(
        `Are you sure you want to delete the pricelist package "${pricelist.group}"?`
      )
    ) {
      const newPricelists = formData.pricelists.filter((pl) => pl.id !== id);
      setFormData((prev) => ({ ...prev, pricelists: newPricelists }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate unique group names
    const groups = formData.pricelists.map((pl) => pl.group);
    const uniqueGroups = new Set(groups);
    if (groups.length !== uniqueGroups.size) {
      alert('Each pricelist package must have a unique group name.');
      return;
    }

    // Ensure no Symbol or non-serializable data exists
    const isSerializable = (obj: any): boolean => {
      try {
        JSON.stringify(obj);
        return true;
      } catch (e) {
        return false;
      }
    };

    if (!isSerializable(formData)) {
      alert('Form contains non-serializable data. Please check your inputs.');
      return;
    }

    // Remove the 'id' field before submitting, as it might not be needed in the backend
    const submissionData = {
      ...formData,
      pricelists: formData.pricelists.map(({ id, ...rest }) => rest),
    };
    onSubmit(submissionData);
    alert('Item has been successfully added/updated.');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto z-50"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close Modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm 
                  ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                aria-current={activeTab === tab ? 'page' : undefined}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          {/* Tabs Content */}
          {activeTab === 'Basic Information' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    required
                    disabled={!!defaultType}
                  >
                    <option value="">Select Type</option>
                    <option value="Medicine">Medicine</option>
                    <option value="Supply">Supply</option>
                    <option value="Labo">Laboratory</option>
                    <option value="Echography">Echography</option>
                    <option value="Xray">X-ray</option>
                    <option value="CTScan">CT Scan</option>
                    <option value="Endo">Endoscopy</option>
                    <option value="ECG">ECG</option>
                    <option value="Coloscopy">Coloscopy</option>
                  </select>
                </div>

                {(formData.type === 'Medicine' ||
                  formData.type === 'Supply') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Generic Name
                      </label>
                      <input
                        type="text"
                        name="genericName"
                        value={formData.genericName}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Reorder Level
                      </label>
                      <input
                        type="number"
                        name="reorderLevel"
                        value={formData.reorderLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        name="expiry"
                        value={formData.expiry}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Cost Details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Cost</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      USD
                    </label>
                    <input
                      type="number"
                      value={formData.cost.USD}
                      onChange={(e) => handleCostChange('USD', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      KHR
                    </label>
                    <input
                      type="number"
                      value={formData.cost.KHR}
                      onChange={(e) => handleCostChange('KHR', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Pricelist Packages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Pricelist Packages
                </h3>
                <button
                  type="button"
                  onClick={addPricelist}
                  className="flex items-center bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <Plus size={16} className="mr-1" /> Add Pricelist
                </button>
              </div>
              {formData.pricelists.length === 0 && (
                <p className="text-gray-500">No pricelist packages added.</p>
              )}
              {formData.pricelists.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                          Group
                        </th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                          Price
                        </th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                          Discount %
                        </th>
                        <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.pricelists.map((pricelist) => (
                        <tr key={pricelist.id}>
                          <td className="px-4 py-2 border-b">
                            <select
                              value={pricelist.group}
                              onChange={(e) =>
                                handlePricelistChange(
                                  pricelist.id,
                                  'group',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              required
                            >
                              <option value="">Select Group</option>
                              {GROUP_OPTIONS.map((group) => (
                                <option key={group} value={group}>
                                  {group}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2 border-b">
                            <input
                              type="number"
                              value={pricelist.price}
                              onChange={(e) =>
                                handlePricelistChange(
                                  pricelist.id,
                                  'price',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              placeholder="Price"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="px-4 py-2 border-b">
                            <input
                              type="number"
                              value={
                                pricelist.discount === null
                                  ? ''
                                  : pricelist.discount
                              }
                              onChange={(e) =>
                                handlePricelistChange(
                                  pricelist.id,
                                  'discount',
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                              placeholder="Discount %"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td className="px-4 py-2 border-b">
                            <button
                              type="button"
                              onClick={() => deletePricelist(pricelist.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label={`Delete Pricelist ${pricelist.group}`}
                            >
                              <Trash size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;

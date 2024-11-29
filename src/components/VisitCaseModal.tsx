import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from 'react-query';
import { useHealthFacility } from '../contexts/HealthFacilityContext';
import { visitCasesApi, VisitCase } from '../services/visitCasesApi';
import { visitsApi } from '../services/visitsApi';

interface VisitCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitCase: VisitCase | null;
  onSubmit: (data: any) => void;
}

const VisitCaseModal: React.FC<VisitCaseModalProps> = ({ isOpen, onClose, visitCase, onSubmit }) => {
  const { currentFacility } = useHealthFacility();
  const [formData, setFormData] = useState({
    med_vis_ref: '',
    med_vis_cas_ref: '',
    lum_srv_id: '',
    typ_lum_ser_id: 1,
    med_vis_cas_org_hls_shortcut: '',
    med_vis_cas_price_khr: 0,
    med_vis_cas_exc_rate_khr: currentFacility?.attributes.exchange || 4000,
    med_vis_cas_is_contract_hf: '1',
    sta_rec_code: 'ACTIV',
    med_vis_id: '',
  });

  const { data: visits } = useQuery('visits', visitsApi.getAll);

  useEffect(() => {
    if (visitCase) {
      setFormData({
        med_vis_ref: visitCase.attributes.med_vis_ref,
        med_vis_cas_ref: visitCase.attributes.med_vis_cas_ref,
        lum_srv_id: visitCase.attributes.lum_srv_id,
        typ_lum_ser_id: visitCase.attributes.typ_lum_ser_id,
        med_vis_cas_org_hls_shortcut: visitCase.attributes.med_vis_cas_org_hls_shortcut,
        med_vis_cas_price_khr: visitCase.attributes.med_vis_cas_price_khr,
        med_vis_cas_exc_rate_khr: visitCase.attributes.med_vis_cas_exc_rate_khr,
        med_vis_cas_is_contract_hf: visitCase.attributes.med_vis_cas_is_contract_hf,
        sta_rec_code: visitCase.attributes.sta_rec_code,
        med_vis_id: visitCase.attributes.med_vis_id.data.id.toString(),
      });
    } else if (currentFacility) {
      setFormData(prev => ({
        ...prev,
        med_vis_cas_ref: visitCasesApi.generateVisitCaseRef(currentFacility.attributes.khmerName),
        med_vis_cas_exc_rate_khr: currentFacility.attributes.exchange || 4000,
      }));
    }
  }, [visitCase, currentFacility]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFacility) {
      console.error('No facility selected');
      return;
    }

    const submitData = {
      ...formData,
      hea_fac_id: currentFacility.id,
      med_vis_id: parseInt(formData.med_vis_id),
      typ_lum_ser_id: parseInt(formData.typ_lum_ser_id.toString()),
      med_vis_cas_price_khr: parseInt(formData.med_vis_cas_price_khr.toString()),
    };

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{visitCase ? 'Edit Visit Case' : 'New Visit Case'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Visit Reference</label>
              <select
                name="med_vis_id"
                value={formData.med_vis_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="">Select Visit</option>
                {visits?.map(visit => (
                  <option key={visit.id} value={visit.id}>
                    {visit.attributes.visitNo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Case Reference</label>
              <input
                type="text"
                name="med_vis_cas_ref"
                value={formData.med_vis_cas_ref}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Service ID</label>
              <input
                type="text"
                name="lum_srv_id"
                value={formData.lum_srv_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type ID</label>
              <input
                type="number"
                name="typ_lum_ser_id"
                value={formData.typ_lum_ser_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price (KHR)</label>
              <input
                type="number"
                name="med_vis_cas_price_khr"
                value={formData.med_vis_cas_price_khr}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Exchange Rate (KHR)</label>
              <input
                type="number"
                name="med_vis_cas_exc_rate_khr"
                value={formData.med_vis_cas_exc_rate_khr}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="sta_rec_code"
                value={formData.sta_rec_code}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                required
              >
                <option value="ACTIV">Active</option>
                <option value="INACT">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {visitCase ? 'Update Visit Case' : 'Create Visit Case'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisitCaseModal;
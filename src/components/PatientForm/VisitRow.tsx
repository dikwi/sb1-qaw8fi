import React from 'react';
import { Edit, Trash, Copy, Save } from 'lucide-react';
import { Visit } from './types';

interface VisitRowProps {
  visit: Visit;
  isEditing: boolean;
  healthFacilities: any[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, visit: Visit) => void;
  onSave: () => void;
  onEdit: (visit: Visit) => void;
  onDelete: (id: number) => void;
  onCopy: (visit: Visit) => void;
}

const VisitRow: React.FC<VisitRowProps> = ({
  visit,
  isEditing,
  healthFacilities,
  onInputChange,
  onSave,
  onEdit,
  onDelete,
  onCopy
}) => {
  return (
    <tr key={visit.id} className="text-sm">
      <td>
        <input
          type="date"
          name="date"
          value={visit.date}
          onChange={(e) => onInputChange(e, visit)}
          disabled={!isEditing}
          className="w-full p-1 border rounded text-sm"
        />
      </td>
      <td>
        <select
          name="healthFacility"
          value={visit.healthFacility}
          onChange={(e) => onInputChange(e, visit)}
          disabled={!isEditing}
          className="w-full p-1 border rounded text-sm"
        >
          <option value=""></option>
          {healthFacilities?.map(facility => (
            <option key={facility.id} value={facility.name}>{facility.name}</option>
          ))}
        </select>
      </td>
      <td>
        <select
          name="caseType"
          value={visit.caseType}
          onChange={(e) => onInputChange(e, visit)}
          disabled={!isEditing}
          className="w-full p-1 border rounded text-sm"
        >
          <option value=""></option>
          <option value="OPD">OPD</option>
          <option value="IPD">IPD</option>
          <option value="Surgery">Surgery</option>
          <option value="Abortion">Abortion</option>
          <option value="Maternity">Maternity</option>
          <option value="Small surgery">Small surgery</option>
        </select>
      </td>
      <td>
        <input
          type="text"
          name="diagnosis"
          value={visit.diagnosis}
          onChange={(e) => onInputChange(e, visit)}
          disabled={!isEditing}
          className="w-full p-1 border rounded text-sm"
        />
      </td>
      <td>
        <textarea
          name="note"
          value={visit.note}
          onChange={(e) => onInputChange(e, visit)}
          disabled={!isEditing}
          className="w-full p-1 border rounded text-sm"
        />
      </td>
      <td>
        {isEditing ? (
          <button onClick={onSave} className="text-green-500 hover:text-green-700">
            <Save size={16} />
          </button>
        ) : (
          <>
            <button onClick={() => onEdit(visit)} className="text-blue-500 hover:text-blue-700 mr-2">
              <Edit size={16} />
            </button>
            <button onClick={() => onDelete(visit.id)} className="text-red-500 hover:text-red-700 mr-2">
              <Trash size={16} />
            </button>
            <button onClick={() => onCopy(visit)} className="text-gray-500 hover:text-gray-700">
              <Copy size={16} />
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default VisitRow;
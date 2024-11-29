import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { itemsApi, Item } from '../services/itemsApi';
import { Plus, Edit, Trash } from 'lucide-react';
import ItemModal from '../components/ItemModal';
import { useHealthFacility } from '../contexts/HealthFacilityContext';

const Items: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Medicine');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const { currentFacility } = useHealthFacility();
  const queryClient = useQueryClient();

  const { data: items, isLoading, error } = useQuery('items', itemsApi.getAll);

  const addMutation = useMutation(itemsApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: number; data: Partial<Item['attributes']> }) =>
      itemsApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('items');
        setIsModalOpen(false);
      },
    }
  );

  const deleteMutation = useMutation(itemsApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('items');
    },
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (!prevConfig || prevConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      if (prevConfig.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const filteredAndSortedItems = useMemo(() => {
    let result = items?.filter((item: Item) => {
      const matchesType = item.attributes.type === filterType;
      const matchesSearch = item.attributes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.attributes.genericName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }) || [];

    if (sortConfig) {
      result.sort((a: Item, b: Item) => {
        let aValue = a.attributes[sortConfig.key as keyof typeof a.attributes];
        let bValue = b.attributes[sortConfig.key as keyof typeof b.attributes];
        
        if (sortConfig.key === 'cost') {
          // Safely access cost.USD with null checks
          aValue = a.attributes.cost?.USD ?? 0;
          bValue = b.attributes.cost?.USD ?? 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [items, filterType, searchTerm, sortConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching items</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Items</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleAddItem}
            className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="mr-2" size={20} />
            Add Item
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search items..."
            className="pl-10 pr-4 py-2 border rounded-md w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          {['Medicine', 'Supply', 'Labo', 'Echography', 'Xray', 'CTScan', 'Endo', 'ECG', 'Coloscopy'].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-md ${
                  filterType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generic Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (USD)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (KHR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedItems.map((item: Item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">{item.attributes.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.attributes.genericName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">${item.attributes.cost?.USD?.toFixed(2) ?? '0.00'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.attributes.cost?.KHR?.toLocaleString() ?? '0'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.attributes.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} items
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ItemModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(itemData) => {
            if (selectedItem?.id) {
              updateMutation.mutate({ id: selectedItem.id, data: itemData });
            } else {
              addMutation.mutate(itemData);
            }
          }}
          item={selectedItem}
          defaultType={filterType}
        />
      )}
    </div>
  );
};

export default Items;
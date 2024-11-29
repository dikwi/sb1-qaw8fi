// UserManagement.tsx
import React, { useState, useEffect } from 'react';
import UserModal from '../components/UserModal';
import { fetchStaff } from '../services/api'; // Assuming you have an API service to fetch staff

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  staffId: string;
}

const UserManagement: React.FC = () => {
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(20);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Fetch staff list when component mounts
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const staff = await fetchStaff();
        setStaffList(staff);
      } catch (error) {
        setStaffError('Failed to fetch staff list');
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchStaffData();
  }, []);

  // Open the modal to add a new user
  const handleAddUser = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  // Open the modal to edit an existing user
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  // Handle form submission from UserModal
  const handleUserSubmit = (user: User) => {
    if (selectedUser) {
      // Update the existing user
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === selectedUser.id ? { ...u, ...user } : u))
      );
    } else {
      // Add a new user
      const newUser = { ...user, id: Date.now().toString() };
      setUsers((prevUsers) => [...prevUsers, newUser]);
    }
    setUserModalOpen(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filter || user.role === filter)
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      <div className="mb-4 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search users..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div>
            <label htmlFor="roleFilter" className="mr-2">
              Role:
            </label>
            <select
              id="roleFilter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value="">All</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Admin">Admin</option>
              <option value="Cashier">Cashier</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAddUser}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add User
          </button>
          <div>
            <label htmlFor="usersPerPage" className="mr-2">
              Users per page:
            </label>
            <select
              id="usersPerPage"
              value={usersPerPage}
              onChange={(e) => setUsersPerPage(Number(e.target.value))}
              className="px-2 py-1 border rounded-md focus:outline-none focus:border-blue-500"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>
      <table className="w-full table-auto mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Role</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
            .map((user) => (
              <tr key={user.id} className="border-b">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center gap-2">
        {currentPage > 1 && (
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Previous
          </button>
        )}
        {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded-md ${
              currentPage === index + 1
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
        {currentPage < totalPages && (
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Next
          </button>
        )}
      </div>
      {isLoadingStaff ? (
        <p>Loading staff list...</p>
      ) : staffError ? (
        <p className="text-red-500">{staffError}</p>
      ) : (
        <UserModal
          isOpen={isUserModalOpen}
          onClose={() => setUserModalOpen(false)}
          onSubmit={handleUserSubmit}
          user={selectedUser}
          staffList={staffList}
        />
      )}
    </div>
  );
};

export default UserManagement;

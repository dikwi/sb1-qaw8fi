import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useHealthFacility } from '../contexts/HealthFacilityContext';
import { useAuthStore } from '../store/authStore';
import {
  Home,
  Users,
  FileText,
  BarChart2,
  Calendar,
  Briefcase,
  ChevronRight,
  LogOut,
  TestTube,
  Camera,
  FileSearch,
  DollarSign,
  Settings,
  Building,
  Package,
  FileText as MedicalRecordIcon,
  Thermometer,
  ChevronDown,
  Key,
  ClipboardList,
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

interface LayoutProps {
  children: React.ReactNode;
  onMedicalRecordsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onMedicalRecordsClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentFacility, facilities, setCurrentFacility } = useHealthFacility();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPathActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    if (path === '/health-facility') {
      return location.pathname === '/health-facility';
    }
    return location.pathname.startsWith(path) && path !== '/health-facility';
  };

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value);
    const facility = facilities.find((f) => f.id === selectedId);
    setCurrentFacility(facility || null);
  };

  const menuGroups = [
    {
      title: 'Core',
      items: [
        { to: '/dashboard', icon: <Home />, text: 'Dashboard', exact: true },
        { to: '/patients', icon: <Users />, text: 'Patients' },
        { to: '/appointments', icon: <Calendar />, text: 'Appointments' },
      ],
    },
    {
      title: 'Patient Care',
      items: [
        { to: '/visits', icon: <ClipboardList />, text: 'Visits' },
        { to: '/visit-cases', icon: <FileText />, text: 'Visit Cases' },
      ],
    },
    {
      title: 'Clinical',
      items: [
        { to: '/lab-tests', icon: <TestTube />, text: 'Lab Tests' },
        { to: '/imaging', icon: <Camera />, text: 'Imaging' },
        { to: '/results', icon: <FileSearch />, text: 'Results' },
        {
          action: onMedicalRecordsClick,
          icon: <MedicalRecordIcon />,
          text: 'Medical Records',
        },
      ],
    },
    {
      title: 'Pharmacy',
      items: [{ to: '/pharmacy', icon: <Thermometer />, text: 'Pharmacy' }],
    },
    {
      title: 'Billing & Payments',
      items: [
        { to: '/invoicing', icon: <FileText />, text: 'Billing' },
        { to: '/claims', icon: <DollarSign />, text: 'Claims' },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          to: '/human-resources',
          icon: <Briefcase />,
          text: 'Human Resources',
        },
        { to: '/items', icon: <Package />, text: 'Pricelist' },
        {
          to: '/health-facility',
          icon: <Building />,
          text: 'Facilities',
          exact: true,
        },
        { to: '/reports', icon: <BarChart2 />, text: 'Reports' },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <nav
        className={`bg-white shadow-lg ${
          isExpanded ? 'w-64' : 'w-20'
        } transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          {isExpanded && (
            <h1 className="text-xl font-bold text-blue-600">APPOLO</h1>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <ChevronRight
              className={`w-6 h-6 text-gray-500 transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {menuGroups.map((group, index) => (
            <div key={index} className="py-4">
              {isExpanded && (
                <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.title}
                </h2>
              )}
              <ul>
                {group.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="mb-1">
                    {item.to ? (
                      <NavLink
                        to={item.to}
                        className={({ isActive }) => {
                          const active = isPathActive(item.to, item.exact);
                          return `flex items-center py-2 px-4 rounded transition-colors duration-200 ${
                            active
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-700 hover:bg-gray-200'
                          }`;
                        }}
                      >
                        {item.icon}
                        {isExpanded && (
                          <span className="ml-4">{item.text}</span>
                        )}
                      </NavLink>
                    ) : (
                      <button
                        onClick={item.action}
                        className="flex items-center w-full py-2 px-4 rounded transition-colors duration-200 text-gray-700 hover:bg-gray-200"
                      >
                        {item.icon}
                        {isExpanded && (
                          <span className="ml-4">{item.text}</span>
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 flex flex-col">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {facilities?.length > 0 && (
                <select
                  value={currentFacility?.id || ''}
                  onChange={handleFacilityChange}
                  className="border rounded-md px-3 py-2"
                  disabled={!!user?.hf}
                >
                  <option value="">Select Facility</option>
                  {facilities.map((facility) => (
                    <option 
                      key={facility.id} 
                      value={facility.id}
                      disabled={user?.hf && user.hf.id !== facility.id}
                    >
                      {facility.attributes.name}
                    </option>
                  ))}
                </select>
              )}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <span>{user?.username || 'User'}</span>
                  <ChevronDown size={20} className="ml-1" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setIsChangePasswordModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Key size={16} className="inline mr-2" />
                      Change Password
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 flex-grow">{children}</div>

        <div className="bg-yellow-500 text-black py-2 px-4 text-center">
          <strong>Attention:</strong> This is a DEMO version. Your changes will
          not be stored in the database!!!
        </div>
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default Layout;
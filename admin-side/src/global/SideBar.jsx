import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import CompanyLogo from '../assets/company-logo.png';

import ManageMembers from '../pages/ManageMembers';
import MembersArchive from '@/pages/MembersArchive';
import AuthenticationCode from '@/pages/AuthenticationCode';
import UserFeedback from '@/components/user-feedback/UserFeedback';

import { MdPeopleAlt } from 'react-icons/md';
import { FaArchive, FaSignOutAlt } from 'react-icons/fa';
import { BiCodeAlt } from 'react-icons/bi';
import { MdFeedback } from 'react-icons/md';

import { auth } from '../firebase/firebaseConfig';

const SideBar = () => {
  const [activeComponent, setActiveComponent] = useState('manageMembers');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();
  const iconSize = 20;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/');
    });

    return () => unsubscribe();
  }, [navigate]);

  const renderComponent = () => {
    switch (activeComponent) {
      case 'manageMembers':
        return <ManageMembers />;
      case 'membersArchive':
        return <MembersArchive />;
      case 'authenticationCode':
        return <AuthenticationCode />;
      case 'userFeedback': // ⭐ NEW
        return <UserFeedback />;
      default:
        return <ManageMembers />;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Sign out failed', error);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 100) {
      setIsSidebarOpen(false);
    }
  };

  const MenuItem = ({ icon: Icon, label, isActive, onClick }) => (
    <li
      className={`flex items-center px-4 py-3 mb-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-green-50 text-green-600 font-medium'
          : 'text-gray-700 hover:bg-gray-50'
      }`}
      onClick={onClick}
    >
      <Icon
        size={iconSize}
        className={`mr-3 ${isActive ? 'text-green-600' : 'text-gray-500'}`}
      />
      <span className="text-sm">{label}</span>
    </li>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:relative md:w-64 md:static`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={CompanyLogo} alt="Logo" className="w-8 h-8" />

            <div className="leading-tight">
              <h1 className="text-base font-bold text-gray-900">
                Fitness Zone
              </h1>
              <p className="text-sm text-gray-500">Fitness Center</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-140px)]">
          <ul className="space-y-1">
            <MenuItem
              icon={MdPeopleAlt}
              label="Manage Members"
              isActive={activeComponent === 'manageMembers'}
              onClick={() => {
                setActiveComponent('manageMembers');
                setIsSidebarOpen(false);
              }}
            />

            <MenuItem
              icon={FaArchive}
              label="Members Archive"
              isActive={activeComponent === 'membersArchive'}
              onClick={() => {
                setActiveComponent('membersArchive');
                setIsSidebarOpen(false);
              }}
            />

            <MenuItem
              icon={BiCodeAlt}
              label="Authentication Code"
              isActive={activeComponent === 'authenticationCode'}
              onClick={() => {
                setActiveComponent('authenticationCode');
                setIsSidebarOpen(false);
              }}
            />

            {/* ⭐ NEW MENU ITEM */}
            <MenuItem
              icon={MdFeedback}
              label="User Feedback"
              isActive={activeComponent === 'userFeedback'}
              onClick={() => {
                setActiveComponent('userFeedback');
                setIsSidebarOpen(false);
              }}
            />
          </ul>

          {/* Logout */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <FaSignOutAlt size={iconSize} className="mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hamburger Button */}
      {!isSidebarOpen && (
        <button
          className="fixed top-4 left-4 text-gray-800 text-2xl z-50 md:hidden bg-white rounded-lg p-2 shadow-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto md:ml-0">
        {renderComponent()}
      </div>

      {/* Sign Out Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-11/12 max-w-md">
            <h3 className="text-xl font-bold mb-2 text-gray-800">
              Confirm Sign Out
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to sign out of your admin account?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;

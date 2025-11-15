import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import lfgLogo from '../assets/LFG.jpg';

const Navbar = () => {
  const [active, setActive] = useState('');
  const navigate = useNavigate(); // Use the navigate hook

  const handleClick = (item) => {
    setActive(item);
  };

  const handleLoginClick = () => {
    navigate('/divider'); // Navigate to /divider when Log In button is clicked
  };

  const menuItems = [
    { name: 'HOME', href: '/' },
    { name: 'ABOUT US', href: '/about-us' },
    { name: 'HIGHLIGHTS', href: '/highlights' },
    { name: 'FAQs', href: '/faqs' },
  ];

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-md">
      {/* Logo Section */}
      <div className="flex items-center">
        <img src={lfgLogo} alt="LFG Logo" className="h-8 mr-4" />
      </div>

      <div className="flex items-center space-x-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => handleClick(item.name)}
            className={({ isActive }) =>
              `text-black font-medium py-2 px-4 transition-all duration-300 ${
                isActive || active === item.name
                  ? 'bg-white shadow-2xl transform translate-y-1 border-t-4 border-black'
                  : 'hover:shadow-xl hover:translate-y-1 hover:bg-gray-100'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
        {/* Log In Button */}
        <button
          onClick={handleLoginClick} // Navigate to /divider on click
          className="bg-black text-white py-2 px-6 rounded-full hover:bg-gray-800"
        >
          Log In
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

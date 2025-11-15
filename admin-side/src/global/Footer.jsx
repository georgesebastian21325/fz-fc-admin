import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import lfgLogo from '../assets/LFG.jpg';
import fbLogo from '../assets/fb.jpg';
import backgroundImage from '../assets/1.jpg'; // Import the background image

const Footer = () => {
    const [active, setActive] = useState("");

    const handleClick = (item) => {
        setActive(item);
    };

    const menuItems = [
        { name: 'HOME', href: '/' },
        { name: 'FITFUSION', href: '/fitfusion' },
        { name: 'ABOUT US', href: '/about-us' },
        { name: 'HIGHLIGHTS', href: '/highlights' },
        { name: 'FAQs', href: '/faqs' }
    ];

    return (
        <footer className="bg-black text-white">
            {/* Top Section with Background Image and Buttons */}
            <div
                className="bg-cover bg-center py-20 pl-48 pr-16"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            >
                <div className="text-left max-w-lg">
                    <h2 className="text-4xl font-bold mb-4">Got some questions?</h2>
                    <p className="text-4xl font-bold mb-8">We got you here!</p>
                    <div className="flex space-x-4">
                        <NavLink
                            to="/faqs"
                            className="bg-black text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-800"
                        >
                            Visit FAQs
                        </NavLink>
                        <NavLink
                            to="/contact-us"
                            className="bg-black text-white py-2 px-6 rounded-full shadow-lg hover:bg-gray-800"
                        >
                            Contact Us
                        </NavLink>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Logo, Address, and Menu Items */}
            <div className="flex justify-between items-center mx-auto py-8" style={{ maxWidth: '80%' }}>
                {/* Left Side: Logo and Address */}
                <div className="flex flex-col items-start ml-10">
                    <img src={lfgLogo} alt="LFG Logo" className="h-12 mb-4" />
                    <p className="text-sm leading-snug">
                        Malingap Street corner Mahiyain Street,<br />
                        Teachers Village East,<br />
                        Diliman, Quezon City, Philippines
                    </p>
                    <div className="mt-4">
                        <img src={fbLogo} alt="Facebook Logo" className="h-6 w-6" />
                    </div>
                </div>

                {/* Right Side: Menu Items */}
                <div className="flex flex-col space-y-4 text-right mr-10">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => handleClick(item.name)}
                            className={({ isActive }) => 
                                `font-medium py-2 px-4 transition-all duration-300 ${
                                    isActive || active === item.name
                                        ? 'bg-white text-black shadow-2xl transform translate-y-1 border-t-4 border-black'
                                        : 'text-white hover:shadow-xl hover:translate-y-1 hover:bg-gray-100 hover:text-black'
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;

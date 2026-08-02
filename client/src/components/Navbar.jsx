import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
  const { userData } = useSelector((state) => state.user);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showAuth, setShowAuth] = useState(false); 

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      setShowUserPopup(false);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-8 py-4 flex justify-between items-center relative"
      >
        <div onClick={() => navigate("/")} className="flex items-center gap-3 cursor-pointer">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>
          <h1 className="font-semibold hidden md:block text-lg">
            InterviewIQ.AI
          </h1>
        </div>

        <div className="flex items-center gap-6 relative">
          {/* Direct Navigation to Pricing when clicking Credits button */}
          <div className="relative">
            <button
              onClick={() => {
                if (!userData) {
                  setShowAuth(true);
                  return;
                }
                navigate("/pricing");
              }}
              title="Click to Buy Credits / View Pricing"
              className="flex items-center gap-2 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200 px-4 py-2 rounded-full text-md transition cursor-pointer"
            >
              <BsCoin size={20} className="text-amber-500" />
              <span className="font-semibold">{userData?.credits || 0}</span>
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => { 
                if (!userData) {
                  setShowAuth(true);
                  return; 
                }
                setShowUserPopup(!showUserPopup);
              }}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
            >
              {userData ? (
                userData?.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-48 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                <p className="text-md text-blue-500 font-medium mb-1">
                  {userData?.name}
                </p>

                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate("/history");
                  }}
                  className="w-full text-left text-sm py-2 hover:text-black text-gray-600 cursor-pointer"
                >
                  Interview History
                </button>
                <button
                  onClick={() => {
                    setShowUserPopup(false);
                    navigate("/pricing");
                  }}
                  className="w-full text-left text-sm py-2 hover:text-black text-gray-600 cursor-pointer"
                >
                  Buy Credits / Pricing
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-sm py-2 flex items-center gap-2 text-red-500 cursor-pointer"
                >
                  <HiOutlineLogout size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default Navbar;

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const AuthenticationCode = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(
          collection(db, "users")
        );
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Only include active users who are not the admin and have not authenticated
        const approved = usersList.filter(
          (user) =>
            user.active &&
            !user.isAuthenticated &&
            user.email !==
              "lifestylefitnessgymlfg1@gmail.com" // Exclude admin email
        );
        setApprovedUsers(approved);
      } catch (error) {
        console.error(
          "Error fetching approved users:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedUsers();
  }, []); // Effect runs once on component mount

  const generateAuthCode = () => {
    return Math.floor(100000 + Math.random() * 900000); // 6-digit random code
  };

  const handleGenerateCode = async (userId, email) => {
    const authCode = generateAuthCode();

    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { authCode: authCode });

    // Update the list of approved users
    setApprovedUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, authCode: authCode }
          : user
      )
    );

    alert(`Authentication code generated for ${email}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Approved Users and Authentication Codes
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600 border-solid"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">
                  Email
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Authentication Code
                </th>
                <th className="py-4 px-6 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    {user.email}
                  </td>
                  <td className="py-4 px-6">
                    {user.authCode
                      ? user.authCode
                      : "Not Generated"}
                  </td>
                  <td className="py-4 px-6 text-center">
                    {!user.authCode && (
                      <button
                        onClick={() =>
                          handleGenerateCode(
                            user.id,
                            user.email
                          )
                        }
                        className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 focus:ring-4 focus:ring-gray-300 active:bg-gray-700 transition-all duration-200"
                      >
                        Generate Code
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuthenticationCode;

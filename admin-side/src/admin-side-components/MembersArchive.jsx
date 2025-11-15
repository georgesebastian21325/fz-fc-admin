import React, { useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const MembersArchive = () => {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch archived users
  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        const usersSnapshot = await getDocs(
          collection(db, "users")
        );
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const archived = usersList.filter(
          (user) => user.status === "archived"
        );
        setArchivedUsers(archived);
      } catch (error) {
        console.error(
          "Error fetching archived users:",
          error
        );
      }
    };

    fetchArchivedUsers();
  }, []);

  // Mark user as "deleted" in Firestore
  const deleteUserPermanently = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { status: "deleted" });
      setArchivedUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      alert("User marked as deleted permanently.");
    } catch (error) {
      console.error(
        "Error deleting user permanently:",
        error
      );
      alert("Failed to delete user. Please try again.");
    }
  };

  // Restore user from archive
  const restoreUser = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { status: "active" }); // Set status back to "active"
      setArchivedUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      alert("User restored successfully.");
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Members Archive
      </h1>
      <div className="relative mb-8">
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
          <table className="w-full table-auto text-sm text-gray-700">
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => {
                      setSelectAll(!selectAll);
                      setSelectedUsers(
                        !selectAll
                          ? archivedUsers.map(
                              (user) => user.id
                            )
                          : []
                      );
                    }}
                  />
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Email
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Status
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Membership Expiry
                </th>
                <th className="py-4 px-6 text-left font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {archivedUsers.length > 0 ? (
                archivedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(
                          user.id
                        )}
                        onChange={() => {
                          setSelectedUsers((prevSelected) =>
                            prevSelected.includes(user.id)
                              ? prevSelected.filter(
                                  (id) => id !== user.id
                                )
                              : [...prevSelected, user.id]
                          );
                        }}
                      />
                    </td>
                    <td className="py-4 px-6">
                      {user.email}
                    </td>
                    <td className="py-4 px-6">Archived</td>
                    <td className="py-4 px-6">
                      {user.membershipExpiry
                        ? new Date(
                            user.membershipExpiry
                          ).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => restoreUser(user.id)}
                        className="bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300 transition-all duration-200 mr-2"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() =>
                          deleteUserPermanently(user.id)
                        }
                        className="bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300 transition-all duration-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-6 text-center"
                  >
                    No archived members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersArchive;

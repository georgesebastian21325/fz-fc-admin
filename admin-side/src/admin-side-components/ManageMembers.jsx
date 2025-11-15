import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ManageMembers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [membershipDuration, setMembershipDuration] =
    useState(1); // Default to 1 month
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user for the modal
  const [promptMessage, setPromptMessage] = useState(""); // Track the prompt message
  const [showPrompt, setShowPrompt] = useState(false); // Flag to show the prompt
  const [sortOption, setSortOption] = useState(""); // Dropdown visibility
  const [emailSortOrder, setEmailSortOrder] =
    useState("asc"); // Separate state for email sort order
  const [
    remainingDaysSortOrder,
    setRemainingDaysSortOrder,
  ] = useState("asc"); // Separate state for remaining days sort order
  const [
    showDeleteConfirmModal,
    setShowDeleteConfirmModal,
  ] = useState(false);
  const [renewModal, setRenewModal] = useState(false);

  useEffect(() => {
    const fetchAndUpdateUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(
          collection(db, "users")
        );
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched Users:", usersList); // Debugging

        const filteredUsers = usersList.filter(
          (user) =>
            user.email !==
            "lifestylefitnessgymlfg1@gmail.com"
        );

        console.log("Filtered Users:", filteredUsers); // Debugging

        const today = new Date();
        const verified = [];
        const pending = [];
        const archived = [];

        for (const user of filteredUsers) {
          const expiryDate = user.membershipExpiry
            ? new Date(user.membershipExpiry)
            : null;

          // Check if the membership is expired and if 7 days have passed
          if (
            user.status === "active" &&
            expiryDate &&
            expiryDate < today
          ) {
            const daysSinceExpiry = Math.ceil(
              (today - expiryDate) / (1000 * 60 * 60 * 24)
            );

            if (daysSinceExpiry > 7) {
              // Archive user
              await updateDoc(doc(db, "users", user.id), {
                status: "archived",
              });
              archived.push({
                ...user,
                status: "archived",
              });
            } else {
              verified.push(user);
            }
          } else if (user.status === "active") {
            verified.push(user);
          } else if (user.status === "pending") {
            pending.push(user);
          } else if (user.status === "archived") {
            archived.push(user);
          }
        }

        console.log("Verified Users:", verified); // Debugging
        console.log("Pending Users:", pending); // Debugging
        console.log("Archived Users:", archived); // Debugging

        setVerifiedUsers(verified);
        setPendingUsers(pending);
        setArchivedUsers(archived);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndUpdateUsers();
  }, []);

  const approveUser = async (userId) => {
    if (membershipDuration < 1 || membershipDuration > 12) {
      alert(
        "Please select a membership duration between 1 and 12 months."
      );
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      const expiryDate = new Date();
      expiryDate.setDate(
        expiryDate.getDate() + membershipDuration * 30
      );

      // Update the user's membership expiry and active status in Firestore
      await updateDoc(userDoc, {
        active: true,
        membershipExpiry: expiryDate.toISOString(),
        status: "active", // Set status to verified
      });

      const updatedUser = {
        id: userId,
        active: true,
        membershipExpiry: expiryDate.toISOString(),
        email: pendingUsers.find(
          (user) => user.id === userId
        )?.email,
        status: "active", // Ensure status is updated in local state as well
      };

      // Update local state: Remove from pending and add to verified
      setPendingUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      setVerifiedUsers((prev) => [...prev, updatedUser]);

      alert(
        `User approved with ${membershipDuration} month(s) membership!`
      );
    } catch (error) {
      console.error("Error approving user:", error);
      setError("Failed to approve user.");
    } finally {
      setLoading(false);
    }
  };

  const denyUser = async (userId) => {
    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { active: false });
      setPendingUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      alert("User denied.");
    } catch (error) {
      console.error("Error denying user:", error);
      setError("Failed to deny user.");
    } finally {
      setLoading(false);
    }
  };
  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, { status: "archived" });

      const archivedUser = verifiedUsers.find(
        (user) => user.id === userId
      );
      setVerifiedUsers((prev) =>
        prev.filter((user) => user.id !== userId)
      );
      setArchivedUsers((prev) => [...prev, archivedUser]);

      setPromptMessage("User archived successfully.");
      setShowPrompt(true);
    } catch (error) {
      console.error("Error archiving user:", error);
      setError("Failed to archive user.");
    } finally {
      setLoading(false);
    }
  };

  const renewMembership = async (userId, months) => {
    if (months < 1 || months > 12) {
      setPromptMessage(
        "Please select a valid number of months (1-12)."
      );
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(
        newExpiryDate.getMonth() + months
      );

      await updateDoc(userDoc, {
        membershipExpiry: newExpiryDate.toISOString(),
        active: true, // Reactivate if needed
      });

      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                membershipExpiry:
                  newExpiryDate.toISOString(),
              }
            : u
        )
      );

      setPromptMessage(
        `Membership renewed for ${months} month(s). New expiry date: ${newExpiryDate.toLocaleDateString()}`
      );
      setShowPrompt(true);
      setRenewModal(false); // Close the modal after updating
    } catch (error) {
      console.error("Error renewing membership:", error);
      setError("Failed to renew membership.");
    } finally {
      setLoading(false);
    }
  };

  const calculateRemainingDays = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry - today;
    const daysRemaining = Math.ceil(
      timeDiff / (1000 * 60 * 60 * 24)
    );
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  const openUserModal = (userId) => {
    // Fetch the user's detailed profile info when clicked
    const user = [...verifiedUsers, ...pendingUsers].find(
      (user) => user.id === userId
    );
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  // Helper function to format the Date of Birth
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB"); // Adjust the format as needed
  };

  // Function to extend membership by additional days
  const extendMembership = async (
    userId,
    additionalDays
  ) => {
    if (additionalDays < 1) {
      setPromptMessage(
        "Please enter a valid number of days."
      );
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      const user = verifiedUsers.find(
        (user) => user.id === userId
      );

      if (!user || !user.membershipExpiry) {
        setPromptMessage(
          "User does not have an active membership."
        );
        setShowPrompt(true);
        return;
      }

      const currentExpiryDate = new Date(
        user.membershipExpiry
      );
      const newExpiryDate = new Date(
        currentExpiryDate.setDate(
          currentExpiryDate.getDate() + additionalDays
        )
      );

      await updateDoc(userDoc, {
        membershipExpiry: newExpiryDate.toISOString(),
      });

      // Update the verifiedUsers state
      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                membershipExpiry:
                  newExpiryDate.toISOString(),
              }
            : u
        )
      );

      setPromptMessage(
        `Membership extended by ${additionalDays} day(s). New expiry date: ${newExpiryDate.toLocaleDateString()}`
      );
      setShowPrompt(true);
      closeModal(); // Close the modal immediately after updating
    } catch (error) {
      console.error("Error extending membership:", error);
      setError("Failed to extend membership.");
    } finally {
      setLoading(false);
    }
  };

  // Function to shorten membership by fewer days
  const shortenMembership = async (userId, fewerDays) => {
    if (fewerDays < 1) {
      setPromptMessage(
        "Please enter a valid number of days."
      );
      setShowPrompt(true);
      return;
    }

    setLoading(true);
    try {
      const userDoc = doc(db, "users", userId);
      const user = verifiedUsers.find(
        (user) => user.id === userId
      );

      if (!user || !user.membershipExpiry) {
        setPromptMessage(
          "User does not have an active membership."
        );
        setShowPrompt(true);
        return;
      }

      const currentExpiryDate = new Date(
        user.membershipExpiry
      );
      const today = new Date();

      // Check if the membership is already expired or has no remaining days
      if (currentExpiryDate <= today) {
        setPromptMessage(
          "Membership has already expired and cannot be shortened."
        );
        setShowPrompt(true);
        return;
      }

      const remainingDays = calculateRemainingDays(
        user.membershipExpiry
      );
      if (remainingDays === 0) {
        setPromptMessage(
          "Membership has no remaining days to shorten."
        );
        setShowPrompt(true);
        return;
      }

      const newExpiryDate = new Date(
        currentExpiryDate.setDate(
          currentExpiryDate.getDate() - fewerDays
        )
      );

      // Ensure the new expiry date is not before today
      if (newExpiryDate < today) {
        setPromptMessage(
          "Cannot shorten the membership beyond today's date."
        );
        setShowPrompt(true);
        return;
      }

      await updateDoc(userDoc, {
        membershipExpiry: newExpiryDate.toISOString(),
      });

      // Update the verifiedUsers state
      setVerifiedUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                membershipExpiry:
                  newExpiryDate.toISOString(),
              }
            : u
        )
      );

      setPromptMessage(
        `Membership shortened by ${fewerDays} day(s). New expiry date: ${newExpiryDate.toLocaleDateString()}`
      );
      setShowPrompt(true);
      closeModal(); // Close the modal immediately after updating
    } catch (error) {
      console.error("Error shortening membership:", error);
      setError("Failed to shorten membership.");
    } finally {
      setLoading(false);
    }
  };

  const handleSortEmail = () => {
    setEmailSortOrder(
      emailSortOrder === "asc" ? "desc" : "asc"
    );
    sortUsers(
      "email",
      emailSortOrder === "asc" ? "desc" : "asc"
    );
  };

  const handleSortRemainingDays = () => {
    setRemainingDaysSortOrder(
      remainingDaysSortOrder === "asc" ? "desc" : "asc"
    );
    sortUsers(
      "remainingDays",
      remainingDaysSortOrder === "asc" ? "desc" : "asc"
    );
  };

  const sortUsers = (key, order) => {
    const sortedUsers = [...verifiedUsers].sort((a, b) => {
      if (key === "email") {
        return order === "asc"
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email);
      } else if (key === "remainingDays") {
        const remainingA = calculateRemainingDays(
          a.membershipExpiry
        );
        const remainingB = calculateRemainingDays(
          b.membershipExpiry
        );
        return order === "asc"
          ? remainingA - remainingB
          : remainingB - remainingA;
      }
      return 0;
    });
    setVerifiedUsers(sortedUsers);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8 text-center">
        Manage Users
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px] sm:min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-gray-600 border-solid"></div>
        </div>
      ) : (
        <div>
          {/* Verified Users Section */}
          <div className="relative mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
              Verified Users
            </h2>
            <button
              onClick={() =>
                setSortOption(sortOption ? "" : "sort")
              }
              className="absolute top-0 right-0 bg-blue-500 text-white py-1 px-3 sm:py-2 sm:px-4 rounded-md flex items-center gap-1 text-sm sm:text-base"
            >
              <i className="fas fa-filter"></i> Filter
            </button>

            {sortOption && (
              <div className="absolute top-10 sm:top-12 right-0 bg-white shadow-lg p-4 rounded-lg w-full sm:w-auto">
                <div>
                  <button
                    className="text-gray-700 mb-2 text-sm sm:text-base"
                    onClick={handleSortEmail}
                  >
                    Sort by Email (
                    {emailSortOrder === "asc"
                      ? "Ascending"
                      : "Descending"}
                    )
                  </button>
                </div>
                <button
                  className="text-gray-700 text-sm sm:text-base"
                  onClick={handleSortRemainingDays}
                >
                  Sort by Remaining Days (
                  {remainingDaysSortOrder === "asc"
                    ? "Ascending"
                    : "Descending"}
                  )
                </button>
              </div>
            )}

            <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
              <table className="w-full table-auto text-sm sm:text-base text-gray-700">
                <thead className="bg-gray-600 text-white">
                  <tr>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Email
                    </th>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Status
                    </th>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Membership Expiry
                    </th>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Remaining Days
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50"
                      onClick={() => openUserModal(user.id)}
                    >
                      <td className="py-2 sm:py-4 px-4 sm:px-6">
                        {user.email}
                      </td>
                      <td className="py-2 sm:py-4 px-4 sm:px-6">
                        {user.active
                          ? "Verified"
                          : "Pending"}
                      </td>
                      <td className="py-2 sm:py-4 px-4 sm:px-6">
                        {user.membershipExpiry
                          ? new Date(
                              user.membershipExpiry
                            ).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-2 sm:py-4 px-4 sm:px-6 flex items-center gap-2">
                        {user.membershipExpiry
                          ? calculateRemainingDays(
                              user.membershipExpiry
                            )
                          : "N/A"}{" "}
                        days
                        {calculateRemainingDays(
                          user.membershipExpiry
                        ) === 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent table row click
                              setRenewModal(true); // Open Renew Membership Modal
                              setSelectedUser(user); // Set the user for Renew Modal
                            }}
                            className="bg-yellow-500 text-white py-1 sm:py-2 px-2 sm:px-4 rounded-lg hover:bg-yellow-600"
                          >
                            Renew
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Users Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
              Pending Users
            </h2>
            <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-gray-300">
              <table className="w-full table-auto text-sm sm:text-base text-gray-700">
                <thead className="bg-gray-600 text-white">
                  <tr>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Email
                    </th>
                    <th className="py-2 sm:py-4 px-4 sm:px-6 text-left font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-2 sm:py-4 px-4 sm:px-6">
                        {user.email}
                      </td>
                      <td className="py-2 sm:py-4 px-4 sm:px-6 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                          <label
                            htmlFor={`duration-${user.id}`}
                            className="text-sm sm:text-base font-semibold"
                          >
                            Duration (months):
                          </label>
                          <select
                            id={`duration-${user.id}`}
                            value={membershipDuration}
                            onChange={(e) =>
                              setMembershipDuration(
                                Number(e.target.value)
                              )
                            }
                            className="p-2 border rounded-lg"
                          >
                            {Array.from(
                              { length: 12 },
                              (_, i) => i + 1
                            ).map((i) => (
                              <option key={i} value={i}>
                                {i}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-center gap-2 sm:gap-4">
                          <button
                            onClick={() =>
                              approveUser(user.id)
                            }
                            className="bg-green-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300 active:bg-green-700 transition-all duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              denyUser(user.id)
                            }
                            className="bg-red-500 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300 active:bg-red-700 transition-all duration-200"
                          >
                            Deny
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && !renewModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              User Details
            </h3>
            <p className="text-sm sm:text-base">
              <strong>Email:</strong> {selectedUser.email}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Name:</strong>{" "}
              {selectedUser.firstName}{" "}
              {selectedUser.lastName}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Contact:</strong>{" "}
              {selectedUser.contactNumber}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Address:</strong>{" "}
              {selectedUser.address}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Gender:</strong> {selectedUser.gender}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Date of Birth:</strong>{" "}
              {selectedUser.dateOfBirth
                ? formatDate(selectedUser.dateOfBirth)
                : "N/A"}
            </p>
            <p className="text-sm sm:text-base">
              <strong>Status:</strong>{" "}
              {selectedUser.active ? "Verified" : "Pending"}
            </p>
            {selectedUser.membershipExpiry && (
              <>
                <p className="text-sm sm:text-base">
                  <strong>Membership Expiry:</strong>{" "}
                  {new Date(
                    selectedUser.membershipExpiry
                  ).toLocaleDateString()}
                </p>
                <p className="text-sm sm:text-base">
                  <strong>Remaining Days:</strong>{" "}
                  {calculateRemainingDays(
                    selectedUser.membershipExpiry
                  )}{" "}
                  days
                </p>
              </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
              <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
                <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-4">
                      Cancel Membership
                    </h2>
                    <p className="text-gray-800 text-base mb-6">
                      Are you sure you want to cancel this
                      user's membership?
                    </p>
                    <div className="flex justify-center gap-4 mt-4">
                      <button
                        onClick={() => {
                          setShowDeleteConfirmModal(false);
                          deleteUser(selectedUser.id);
                        }}
                        className="bg-red-600 text-white py-2 px-6 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          setShowDeleteConfirmModal(false)
                        }
                        className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 transition-all duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Extend Membership Section */}
            {selectedUser.active &&
              selectedUser.membershipExpiry && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Extend Membership
                  </h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter days"
                      className="p-2 border rounded-lg w-full"
                      onChange={(e) =>
                        setMembershipDuration(
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        extendMembership(
                          selectedUser.id,
                          membershipDuration
                        )
                      }
                      className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300 active:bg-green-700 transition-all duration-200"
                    >
                      Add Days
                    </button>
                  </div>
                </div>
              )}

            {/* Shorten Membership Section */}
            {selectedUser.active &&
              selectedUser.membershipExpiry && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Shorten Membership
                  </h4>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      placeholder="Enter days"
                      className="p-2 border rounded-lg w-full"
                      onChange={(e) =>
                        setMembershipDuration(
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        shortenMembership(
                          selectedUser.id,
                          membershipDuration
                        )
                      }
                      className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300 active:bg-red-700 transition-all duration-200"
                    >
                      Shorten Days
                    </button>
                  </div>
                </div>
              )}

            {/* Close and Delete Buttons */}
            <div className="flex justify-start mt-4">
              <button
                onClick={closeModal}
                className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 active:bg-blue-700 transition-all duration-200"
              >
                Close
              </button>
              <button
                onClick={() =>
                  setShowDeleteConfirmModal(true)
                }
                className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 focus:ring-4 focus:ring-red-300 active:bg-red-700 transition-all duration-200 ml-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Membership Modal */}
      {renewModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 p-4 sm:p-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Renew Membership for {selectedUser?.email}
            </h2>
            <select
              className="w-full p-2 sm:p-3 border rounded-lg mb-4"
              value={membershipDuration}
              onChange={(e) =>
                setMembershipDuration(
                  Number(e.target.value)
                )
              }
            >
              {Array.from(
                { length: 12 },
                (_, i) => i + 1
              ).map((month) => (
                <option key={month} value={month}>
                  {month} Month(s)
                </option>
              ))}
            </select>
            <div className="flex justify-between">
              <button
                onClick={() => {
                  renewMembership(
                    selectedUser?.id,
                    membershipDuration
                  );
                  setRenewModal(false); // Close the Renew Modal
                  setSelectedUser(null); // Ensure User Details Modal doesn't reappear
                }}
                className="bg-blue-500 text-white py-2 px-4 sm:py-2 sm:px-6 rounded-md hover:bg-blue-600 focus:ring-4 focus:ring-blue-300"
              >
                Renew
              </button>
              <button
                onClick={() => {
                  setRenewModal(false); // Close the Renew Modal
                  setSelectedUser(null); // Ensure User Details Modal doesn't reappear
                }}
                className="bg-gray-300 text-gray-700 py-2 px-4 sm:py-2 sm:px-6 rounded-md hover:bg-gray-400 focus:ring-4 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Prompt */}
      {showPrompt && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p className="text-xl text-gray-800">
              {promptMessage}
            </p>
            <button
              onClick={() => setShowPrompt(false)}
              className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
            >
              Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;

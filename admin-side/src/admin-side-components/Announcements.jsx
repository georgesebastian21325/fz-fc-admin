import React, { useState } from "react";
import { db } from "../firebase/firebaseConfig"; // Import Firestore instance
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"; // Firestore methods

const Announcements = () => {
  const [announcement, setAnnouncement] = useState("");
  const [message, setMessage] = useState(""); // Message for confirmation or errors

  // Function to handle posting an announcement
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = getAuth().currentUser;
    if (!user) {
      setMessage(
        "You must be logged in to post an announcement."
      );
      return;
    }

    if (announcement) {
      try {
        // Add the announcement to Firestore with timestamp
        const docRef = await addDoc(
          collection(db, "announcements"),
          {
            message: announcement,
            timestamp: serverTimestamp(),
            postedBy: user.email,
          }
        );

        // Add the announcement ID to localStorage to avoid reappearing in MemberDashboard
        const dismissedAnnouncements =
          JSON.parse(
            localStorage.getItem("dismissedAnnouncements")
          ) || [];
        dismissedAnnouncements.push(docRef.id); // Store the new announcement's ID
        localStorage.setItem(
          "dismissedAnnouncements",
          JSON.stringify(dismissedAnnouncements)
        );

        setAnnouncement(""); // Clear input field after submission
        setMessage("Announcement posted successfully!");
      } catch (error) {
        console.error(
          "Error posting announcement: ",
          error
        );
        setMessage(
          "Failed to post announcement. Please try again."
        );
      }
    } else {
      setMessage("Please enter an announcement message.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Announcements
      </h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          className="p-2 border border-gray-300 rounded w-full"
          placeholder="Type your announcement here"
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post Announcement
        </button>
      </form>

      {message && (
        <div className="mt-4 text-sm text-gray-600">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Announcements;

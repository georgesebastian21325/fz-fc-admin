import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import emailjs from "emailjs-com";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dayBookings, setDayBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Check if the current user is an admin
  useEffect(() => {
    const checkIfAdmin = () => {
      const user = auth.currentUser;
      if (user) {
        setIsAdmin(
          user.email === "lifestylefitnessgymlfg1@gmail.com"
        );
      }
    };
    checkIfAdmin();
  }, []);

  // Fetch bookings and listen for real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "bookings"),
      async (snapshot) => {
        try {
          const allBookings = [];
          for (const docSnap of snapshot.docs) {
            const bookingData = docSnap.data();
            const userDetails = await fetchUserDetails(
              bookingData.userId
            );

            allBookings.push({
              id: docSnap.id,
              title: `${bookingData.trainer} - ${userDetails.name}`,
              start: bookingData.start,
              end: bookingData.end,
              extendedProps: {
                ...bookingData,
                userName: userDetails.name,
                userEmail: userDetails.email,
              },
            });
          }
          setBookings(allBookings);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching bookings:", err);
          setError("Failed to fetch bookings.");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchUserDetails = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const { firstName, lastName, email } =
          userDocSnap.data();
        return { name: `${firstName} ${lastName}`, email };
      }
      return { name: "Unknown", email: "Unknown" };
    } catch (err) {
      console.error("Error fetching user details:", err);
      return { name: "Unknown", email: "Unknown" };
    }
  };

  // Filter bookings for the selected date
  useEffect(() => {
    const filteredBookings = bookings.filter((booking) => {
      const bookingDate = new Date(
        booking.start
      ).toDateString();
      return bookingDate === selectedDate?.toDateString();
    });
    setDayBookings(filteredBookings);
  }, [selectedDate, bookings]);

  const handleDateClick = (info) => {
    setSelectedDate(info.date);
  };

  // Send email to the user when booking status changes
  const sendUserEmailNotification = (
    email,
    trainer,
    start,
    end,
    status
  ) => {
    emailjs
      .send(
        "service_mt586ga", // Replace with your Service ID
        "template_gm1eqwt", // Replace with your Template ID
        {
          to_name: email, // Email recipient's name (if needed)
          userEmail: email, // User's email
          trainer, // Trainer's name
          start, // Start time of session
          end, // End time of session
          status, // Booking status
        },
        "6dJCooNwGjtLiXGLO" // Replace with your Public Key
      )
      .then(
        (result) => {
          console.log(
            "User email sent successfully:",
            result.text
          );
          alert(`Email sent to ${email}.`);
        },
        (error) => {
          console.error("Error sending user email:", error);
          alert(
            `Failed to send email to ${email}: ${error.text}`
          );
        }
      );
  };

  const handleApprove = async (bookingId) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      const bookingSnapshot = await getDoc(bookingDocRef);

      if (bookingSnapshot.exists()) {
        const bookingData = bookingSnapshot.data();

        // Fetch the user's details from the Firestore `users` collection
        const userDocRef = doc(
          db,
          "users",
          bookingData.userId
        ); // Assume `userId` exists in the `bookings` data
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          throw new Error("User not found.");
        }

        const userData = userSnapshot.data();

        // Update booking status to "approved"
        await updateDoc(bookingDocRef, {
          status: "approved",
        });

        // Send email notification to the user
        sendUserEmailNotification(
          userData.email, // Email from the `users` collection
          bookingData.trainer,
          bookingData.start,
          bookingData.end,
          "approved"
        );

        alert("Booking approved successfully!");
      } else {
        console.error("Booking not found:", bookingId);
        alert("Booking not found. Please try again.");
      }
    } catch (err) {
      console.error("Error approving booking:", err);
      alert("Failed to approve booking. Please try again.");
    }
  };

  const handleReject = async (bookingId) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      const bookingSnapshot = await getDoc(bookingDocRef);

      if (bookingSnapshot.exists()) {
        const bookingData = bookingSnapshot.data();

        // Send email notification to the user
        sendUserEmailNotification(
          bookingData.userEmail,
          bookingData.trainer,
          bookingData.start,
          bookingData.end,
          "rejected"
        );

        // Delete the booking document
        await deleteDoc(bookingDocRef);

        alert("Booking rejected successfully!");
      }
    } catch (err) {
      console.error("Error rejecting booking:", err);
      alert("Failed to reject booking. Please try again.");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Bookings Calendar
      </h1>
      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={bookings}
            dateClick={handleDateClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            eventColor="#007BFF"
            eventTextColor="#FFF"
          />
          {selectedDate && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-700 mb-2">
                Bookings on {selectedDate.toDateString()}
              </h2>
              {dayBookings.length === 0 ? (
                <p>No bookings for this day.</p>
              ) : (
                <ul className="space-y-4">
                  {dayBookings.map((booking) => (
                    <li
                      key={booking.id}
                      className="border p-4 rounded-lg bg-gray-100 shadow-sm"
                    >
                      <p>
                        <strong>User:</strong>{" "}
                        {booking.extendedProps.userName ||
                          "Unknown"}{" "}
                        (
                        {booking.extendedProps.userEmail ||
                          "Unknown"}
                        )
                      </p>
                      <p>
                        <strong>Trainer:</strong>{" "}
                        {booking.extendedProps.trainer ||
                          "N/A"}
                      </p>
                      <p>
                        <strong>Start Time:</strong>{" "}
                        {new Date(
                          booking.start
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>End Time:</strong>{" "}
                        {new Date(
                          booking.end
                        ).toLocaleString()}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {booking.extendedProps.status ||
                          "pending"}
                      </p>
                      {isAdmin &&
                        booking.extendedProps.status ===
                          "pending" && (
                          <div className="flex gap-4 mt-2">
                            <button
                              onClick={() =>
                                handleApprove(booking.id)
                              }
                              className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleReject(booking.id)
                              }
                              className="bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bookings;

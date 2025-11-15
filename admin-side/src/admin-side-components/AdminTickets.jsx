import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  setDoc,
  getDoc,
} from "firebase/firestore";

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ticketsRef = collection(db, "tickets");
    const ticketsQuery = query(
      ticketsRef,
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      ticketsQuery,
      (snapshot) => {
        const fetchedTickets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(fetchedTickets);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching tickets:", err);
        setError(
          "Failed to fetch tickets. Please try again."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const ticketDocRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketDocRef, { status });
      alert(`Ticket status updated to ${status}.`);
    } catch (error) {
      console.error("Error updating ticket status:", error);
      alert(
        "Failed to update ticket status. Please try again."
      );
    }
  };

  const handleArchiveTicket = async (ticketId) => {
    try {
      const ticketDocRef = doc(db, "tickets", ticketId);
      const ticketSnapshot = await getDoc(ticketDocRef);

      if (ticketSnapshot.exists()) {
        const ticketData = ticketSnapshot.data();

        // Move ticket to archivedtickets collection
        const archivedTicketsRef = doc(
          db,
          "archivedtickets",
          ticketId
        );
        await setDoc(archivedTicketsRef, {
          ...ticketData,
          archivedAt: new Date(),
        });

        // Delete the ticket from tickets collection
        await deleteDoc(ticketDocRef);

        alert("Ticket archived successfully!");
        setTickets((prevTickets) =>
          prevTickets.filter(
            (ticket) => ticket.id !== ticketId
          )
        );
      } else {
        throw new Error("Ticket not found.");
      }
    } catch (error) {
      console.error("Error archiving ticket:", error);
      alert("Failed to archive ticket. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Admin: Manage Tickets
      </h2>

      {loading ? (
        <p>Loading tickets...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : tickets.length > 0 ? (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="p-4 bg-white rounded-lg shadow-md border border-gray-300"
            >
              <p className="font-semibold">
                Ticket ID: {ticket.ticketId}
              </p>
              <p className="font-semibold">
                Concern: {ticket.concern}
              </p>
              <p className="text-sm text-gray-500">
                Submitted by: {ticket.firstName}{" "}
                {ticket.lastName}
              </p>
              <p className="text-sm text-gray-500">
                Submitted at:{" "}
                {new Date(
                  ticket.timestamp?.toDate()
                ).toLocaleString()}
              </p>
              <p
                className={`text-sm font-medium mt-2 ${
                  ticket.status === "Resolved"
                    ? "text-green-600"
                    : ticket.status === "In Progress"
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                Status: {ticket.status}
              </p>
              <div className="mt-4 flex justify-end gap-4">
                {ticket.status !== "Resolved" ? (
                  <>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          ticket.id,
                          "In Progress"
                        )
                      }
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Mark as In Progress
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(
                          ticket.id,
                          "Resolved"
                        )
                      }
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark as Resolved
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      handleArchiveTicket(ticket.id)
                    }
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Archive
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">
          No tickets to display.
        </p>
      )}
    </div>
  );
};

export default AdminTickets;

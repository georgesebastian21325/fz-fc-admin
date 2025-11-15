import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Feedback = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      setError(null);

      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const userId = user.uid;
      const isAdmin =
        user.email === "lifestylefitnessgymlfg1@gmail.com";

      try {
        const evaluationsList = [];
        const usersRef = collection(db, "users");

        if (isAdmin) {
          // Admin view: Fetch all evaluations across users
          const usersSnapshot = await getDocs(usersRef);

          for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            const userEvaluationsRef = collection(
              db,
              "users",
              userId,
              "evaluations"
            );
            const userEvaluationsSnapshot = await getDocs(
              userEvaluationsRef
            );

            userEvaluationsSnapshot.forEach((evalDoc) => {
              const evaluation = evalDoc.data();
              evaluationsList.push({
                ...evaluation,
                userName: `${userData.firstName} ${userData.lastName}`, // Combine first and last name
                userEmail: userData.email, // Fetch user's email
              });
            });
          }
        } else {
          // Regular user view: Fetch only their own evaluations
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const evaluationsRef = collection(
              db,
              "users",
              userId,
              "evaluations"
            );
            const evaluationsSnapshot = await getDocs(
              evaluationsRef
            );

            evaluationsSnapshot.forEach((evalDoc) => {
              const evaluation = evalDoc.data();
              evaluationsList.push({
                ...evaluation,
                userName: `${userData.firstName} ${userData.lastName}`,
                userEmail: userData.email,
              });
            });
          }
        }

        setEvaluations(evaluationsList);
      } catch (error) {
        setError(
          "Error fetching evaluations. Please try again."
        );
        console.error("Error fetching evaluations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, []);

  if (loading) {
    return <p>Loading feedback...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        {evaluations.length === 0
          ? "No Evaluations"
          : "Submitted Evaluations"}
      </h2>

      {evaluations.length === 0 ? (
        <p>No evaluations yet.</p>
      ) : (
        <ul className="space-y-4">
          {evaluations.map((evaluation, index) => (
            <li
              key={index}
              className="border p-4 rounded-lg bg-white shadow-sm"
            >
              <h3 className="font-semibold">
                Evaluation {index + 1}
              </h3>
              <p>
                <strong>Submitted by:</strong>{" "}
                {evaluation.userName} (
                {evaluation.userEmail})
              </p>
              <p>
                <strong>Equipment Rating:</strong>{" "}
                {evaluation.equipmentRating} Stars
              </p>
              <p>
                <strong>Cleanliness Rating:</strong>{" "}
                {evaluation.cleanlinessRating} Stars
              </p>
              <p>
                <strong>Staff Rating:</strong>{" "}
                {evaluation.staffRating} Stars
              </p>
              <p>
                <strong>Overall Rating:</strong>{" "}
                {evaluation.overallRating} Stars
              </p>
              <p>
                <strong>Comments:</strong>{" "}
                {evaluation.comments}
              </p>
              <p>
                <strong>Submitted on:</strong>{" "}
                {new Date(
                  evaluation.timestamp
                ).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Feedback;

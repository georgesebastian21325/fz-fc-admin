import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const MemberHealthIssues = () => {
  const [healthIssues, setHealthIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthIssues = async () => {
      try {
        const healthIssuesRef = collection(
          db,
          "healthIssues"
        );
        const querySnapshot = await getDocs(
          healthIssuesRef
        );

        // Fetch user details for each health issue
        const issues = await Promise.all(
          querySnapshot.docs.map(async (docSnap) => {
            const healthIssueData = docSnap.data();
            const userRef = doc(db, "users", docSnap.id); // Assuming `docSnap.id` is the user ID
            const userDoc = await getDoc(userRef);

            // Fallback if user document is not found
            const userDetails = userDoc.exists()
              ? userDoc.data()
              : {
                  firstName: "Unknown",
                  lastName: "Unknown",
                };

            return {
              id: docSnap.id,
              firstName: userDetails.firstName || "Unknown",
              lastName: userDetails.lastName || "Unknown",
              ...healthIssueData,
            };
          })
        );

        setHealthIssues(issues);
      } catch (error) {
        console.error(
          "Error fetching health issues:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHealthIssues();
  }, []);

  if (loading) {
    return (
      <div className="p-4">Loading health issues...</div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Member Health Issues
      </h2>
      {healthIssues.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">
                  Member Name
                </th>
                <th className="px-4 py-2 border-b">
                  Existing Conditions
                </th>
                <th className="px-4 py-2 border-b">
                  Condition Details
                </th>
                <th className="px-4 py-2 border-b">
                  Pain Type
                </th>
                <th className="px-4 py-2 border-b">
                  Other Pain
                </th>
                <th className="px-4 py-2 border-b">
                  Activity Level
                </th>
                <th className="px-4 py-2 border-b">
                  Activity Level (Other)
                </th>
                <th className="px-4 py-2 border-b">
                  Special Assistance
                </th>
                <th className="px-4 py-2 border-b">
                  Assistance Details
                </th>
                <th className="px-4 py-2 border-b">
                  Medical Treatments
                </th>
                <th className="px-4 py-2 border-b">
                  Treatment Details
                </th>
              </tr>
            </thead>
            <tbody>
              {healthIssues.map((issue) => (
                <tr key={issue.id}>
                  <td className="px-4 py-2 border-b">{`${issue.firstName} ${issue.lastName}`}</td>
                  <td className="px-4 py-2 border-b">
                    {issue.existingConditions === "Yes"
                      ? "Yes"
                      : "No"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.existingConditionsDetails ||
                      "None"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.painTypes
                      ? issue.painTypes.join(", ")
                      : "None"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.painTypeOther || "None"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.activityLevel || "Not specified"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.activityLevelOther || "None"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.specialAssistance === "Yes"
                      ? "Yes"
                      : "No"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.specialAssistanceDetails ||
                      "None"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.medicalTreatments === "Yes"
                      ? "Yes"
                      : "No"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {issue.medicalTreatmentsDetails ||
                      "None"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No health issues reported yet.</p>
      )}
    </div>
  );
};

export default MemberHealthIssues;

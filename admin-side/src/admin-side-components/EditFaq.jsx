import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { serverTimestamp, getDoc } from "firebase/firestore";

const App = () => {
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ title: "", description: "" });
  const [editDocument, setEditDocument] = useState(null); // To track the document being edited
  const [isModalOpen, setIsModalOpen] = useState(false); // To toggle modal visibility

  const collectionRef = collection(db, "faq");

  // Fetch Documents
  const fetchDocuments = async () => {
    const data = await getDocs(collectionRef);
    setDocuments(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  // Add Document
  const addDocument = async () => {
    await addDoc(collectionRef, newDocument);
    setNewDocument({ title: "", description: "" });
    fetchDocuments();
  };

  const updateDocument = async (id, updatedData) => {
    try {
      const docRef = doc(db, "faq", id);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const documentData = docSnapshot.data();
  
        // Transfer the current document details to the "archive_equipment" collection
        await addDoc(collection(db, "archive_faqq"), {
          ...documentData,
          date: serverTimestamp(), // Add timestamp
        });
  
        // Update the document with the new data
        await updateDoc(docRef, updatedData);
  
        alert("Document updated and archived successfully!");
      } else {
        alert("Document not found for updating.");
      }
  
      // Refresh documents list
      fetchDocuments();
      setIsModalOpen(false); // Close modal after updating
    } catch (error) {
      console.error("Error updating and archiving document:", error);
      alert("An error occurred while updating the document.");
    }
  };

  const deleteDocument = async (id) => {
    try {
      // Fetch the document to be deleted
      const docRef = doc(db, "faq", id);
      const docSnapshot = await getDoc(docRef);
  
      if (docSnapshot.exists()) {
        const documentData = docSnapshot.data();
  
        // Add the document to the "archive_faq" collection with an additional field for the date
        await addDoc(collection(db, "archive_faq"), {
          ...documentData,
          date: serverTimestamp(), // Add the current time and date
        });
  
        // Delete the document from the original collection
        await deleteDoc(docRef);
  
        // Refresh the documents list
        fetchDocuments();
      } else {
        console.error("Document not found for deletion.");
      }
    } catch (error) {
      console.error("Error transferring and deleting document: ", error);
    }
  };

  // Open Modal for Editing
  const openEditModal = (doc) => {
    setEditDocument(doc);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeEditModal = () => {
    setIsModalOpen(false);
    setEditDocument(null);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Firebase CRUD</h1>

      {/* Add Document Section */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold">Add Document</h2>
        <input
          type="text"
          placeholder="Title"
          value={newDocument.title}
          onChange={(e) =>
            setNewDocument((prev) => ({ ...prev, title: e.target.value }))
          }
          className="border p-2 rounded mb-2 w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={newDocument.description}
          onChange={(e) =>
            setNewDocument((prev) => ({ ...prev, description: e.target.value }))
          }
          className="border p-2 rounded mb-2 w-full"
        />
        <button
          onClick={addDocument}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Documents List */}
      <div className="mt-4">
        <h2 className="text-xl font-bold">Documents</h2>
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-4 rounded shadow mt-2 flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-bold">{doc.title}</h3>
              <p>{doc.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(doc)} // Open modal for editing
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteDocument(doc.id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h3 className="text-xl font-semibold mb-4">Edit Document</h3>
            <input
              type="text"
              value={editDocument?.title || ""}
              onChange={(e) =>
                setEditDocument((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="border p-2 rounded mb-2 w-full"
              placeholder="Title"
            />
            <textarea
              value={editDocument?.description || ""}
              onChange={(e) =>
                setEditDocument((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="border p-2 rounded mb-2 w-full"
              placeholder="Description"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={() =>
                  updateDocument(editDocument.id, {
                    title: editDocument.title,
                    description: editDocument.description,
                  })
                }
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

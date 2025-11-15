import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const Archive = () => {
  const [faqArchive, setFaqArchive] = useState([]);
  const [serviceArchive, setServiceArchive] = useState([]);
  const [equipmentArchive, setEquipmentArchive] = useState([]);

  const [currentFaqPage, setCurrentFaqPage] = useState(1);
  const [currentServicePage, setCurrentServicePage] = useState(1);
  const [currentEquipmentPage, setCurrentEquipmentPage] = useState(1);

  const itemsPerPage = 5; // Number of items per page

  // Fetch archives
  useEffect(() => {
    const fetchArchives = async () => {
      const faqSnapshot = await getDocs(collection(db, "archive_faq"));
      const serviceSnapshot = await getDocs(collection(db, "archive_service"));
      const equipmentSnapshot = await getDocs(collection(db, "archive_equipment"));

      const sortByDateDesc = (data) =>
        data.sort((a, b) => {
          const dateA = a.date?.seconds || 0;
          const dateB = b.date?.seconds || 0;
          return dateB - dateA; // Sort descending by date
        });

      setFaqArchive(sortByDateDesc(faqSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))));
      setServiceArchive(sortByDateDesc(serviceSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))));
      setEquipmentArchive(sortByDateDesc(equipmentSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))));
    };

    fetchArchives();
  }, []);

  // Pagination handlers
  const paginate = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Download JSON File
  const downloadJSON = (data, fileName) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderTable = (data, currentPage, setPage, title, showImage = false) => (
    <div className="bg-white p-4 rounded shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button
          onClick={() => downloadJSON(data, title.replace(" ", "_"))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Download
        </button>
      </div>
      {paginate(data, currentPage).map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center p-4 border-b last:border-0"
        >
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p>{item.description}</p>
            {showImage && item.image ? (
              <div>
                <img
                  src={item.image}
                  alt={item.title || "Service Image"}
                  className="mt-2 w-24 h-24 object-cover rounded"
                />
                <a
                  href={item.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm mt-2 block"
                >
                  {item.image}
                </a>
              </div>
            ) : (
              showImage && (
                <div className="mt-2 w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )
            )}
          </div>
          <div>
            {/* Safely handle the date field */}
            <span className="text-sm text-gray-500">
              {item.date
                ? typeof item.date.toDate === "function"
                  ? item.date.toDate().toLocaleString() // Firestore Timestamp
                  : new Date(item.date).toLocaleString() // String date
                : "No date available"}
            </span>
          </div>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() =>
            setPage((prev) =>
              data.length > currentPage * itemsPerPage ? prev + 1 : prev
            )
          }
          disabled={data.length <= currentPage * itemsPerPage}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Archives</h1>

      {/* FAQ Archive Table */}
      {renderTable(faqArchive, currentFaqPage, setCurrentFaqPage, "FAQ Archive")}

      {/* Service Archive Table */}
      {renderTable(serviceArchive, currentServicePage, setCurrentServicePage, "Service Archive", true)}

      {/* Equipment Archive Table */}
      {renderTable(equipmentArchive, currentEquipmentPage, setCurrentEquipmentPage, "Equipment Archive")}
    </div>
  );
};

export default Archive;

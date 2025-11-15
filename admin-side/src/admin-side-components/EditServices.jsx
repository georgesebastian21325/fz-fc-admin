import React, { useState, useEffect } from 'react';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { app, storage } from "../firebase/firebaseConfig"; // Adjust the import path as needed

const ServicesManager = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editId, setEditId] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);

  const db = getFirestore(app);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "services"));
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleEdit = async (service) => {
    try {
      // Archive the current version of the service
      const archiveData = {
        ...service,
        date: serverTimestamp(),
      };
      await addDoc(collection(db, "archive_service"), archiveData);

      setEditId(service.id);
      setTitle(service.title);
      setDescription(service.description);
      setOriginalImageUrl(service.image);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error archiving service for editing:", error);
      alert("Failed to archive the service before editing. Please try again.");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setImage({
            file: file,
            dataUrl: event.target.result,
            name: file.name,
            type: file.type
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title || !description || (!image && !editId)) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      let imageUrl = originalImageUrl;

      if (image) {
        const imageName = editId ? `${editId}_${image.name}` : image.name;
        const imageRef = ref(storage, `services/${imageName}`);
        await uploadBytes(imageRef, image.file);
        imageUrl = await getDownloadURL(imageRef);

        if (editId && originalImageUrl) {
          const oldImageRef = ref(storage, originalImageUrl);
          await deleteObject(oldImageRef);
        }
      }

      if (editId) {
        // Update existing service
        const serviceDoc = doc(db, "services", editId);
        await updateDoc(serviceDoc, {
          title,
          description,
          image: imageUrl,
        });

        alert("Service updated successfully!");
      } else {
        // Add new service
        await addDoc(collection(db, "services"), {
          title,
          description,
          image: imageUrl,
        });

        alert("Service added successfully!");
      }

      // Reset the form
      setTitle("");
      setDescription("");
      setImage(null);
      setEditId(null);
      setOriginalImageUrl(null);
      setIsModalOpen(false);

      // Refresh services list
      fetchServices();
    } catch (error) {
      console.error("Error uploading service:", error);
      alert("Error adding or updating service. Please try again.");
    }
  };

  const handleDelete = async (id, imageUrl) => {
    try {
      // Find the service data to archive
      const serviceToArchive = services.find((service) => service.id === id);

      if (serviceToArchive) {
        const archiveData = {
          ...serviceToArchive,
          date: serverTimestamp(),
        };

        // Save the service to the archive_service collection
        await addDoc(collection(db, "archive_service"), archiveData);
      }

      // Delete the document from the services collection
      await deleteDoc(doc(db, "services", id));


      alert("Service archived and deleted successfully! (Image retained in storage)");

      // Refresh services list
      fetchServices();
    } catch (error) {
      console.error("Error archiving and deleting service:", error);
      alert("Error archiving or deleting service. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Services Manager</h1>
      <div className="mb-4 p-4 border rounded-lg shadow-md bg-white">
        <h2 className="text-lg font-semibold mb-2">Add New Service</h2>
        <button
          onClick={() => {
            setEditId(null);
            setTitle("");
            setDescription("");
            setImage(null);
            setOriginalImageUrl(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Service
        </button>
      </div>

      {/* Services List */}
      <div>
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.id} className="p-4 border rounded-lg shadow-md bg-white">
              <h2 className="text-lg font-bold">{service.title}</h2>
              <p>{service.description}</p>
              <img src={service.image} alt={service.title} className="mt-2 w-48 h-auto rounded" />
              <div className="mt-4 flex space-x-4">
                <button
                  onClick={() => handleEdit(service)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.image)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editId ? "Edit Service" : "Add New Service"}</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium">Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditId(null);
                    setTitle("");
                    setDescription("");
                    setImage(null);
                    setOriginalImageUrl(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editId ? "Update Service" : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;
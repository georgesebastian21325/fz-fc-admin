export const formatDate = (timestamp) =>
  timestamp
    ? new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No date';

export const getCategoryColor = (category) => {
  const colors = {
    General: 'bg-blue-100 border-blue-300 text-blue-700',
    Equipment: 'bg-purple-100 border-purple-300 text-purple-700',
    Staff: 'bg-green-100 border-green-300 text-green-700',
    Cleanliness: 'bg-teal-100 border-teal-300 text-teal-700',
    Classes: 'bg-orange-100 border-orange-300 text-orange-700',
    Other: 'bg-gray-100 border-gray-300 text-gray-700',
  };
  return colors[category] || colors.Other;
};

import FeedbackItem from './FeedbackItem';

export default function FeedbackList({
  feedback,
  formatDate,
  getCategoryColor,
  setSelectedFeedback,
  setDeleteModal,
}) {
  if (feedback.length === 0)
    return <p className="text-center text-gray-500">No feedback found.</p>;

  return (
    <div className="space-y-4">
      {feedback.map((fb) => (
        <FeedbackItem
          key={fb.id}
          fb={fb}
          formatDate={formatDate}
          getCategoryColor={getCategoryColor}
          setSelectedFeedback={setSelectedFeedback}
          setDeleteModal={setDeleteModal}
        />
      ))}
    </div>
  );
}

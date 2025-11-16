import { X, Star, Calendar, MessageSquare, Filter, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import CategoryBadge from './CategoryBadge';

export default function FeedbackModal({
  feedback,
  close,
  getCategoryColor,
  formatDate,
  setDeleteModal,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-y-auto">
        <div className="p-6 bg-green-600 text-white flex justify-between items-center">
          <h3 className="text-2xl font-bold">Feedback Details</h3>
          <button onClick={close}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <Field label="Name">{feedback.name}</Field>

          <Field label="Rating">
            <StarRating value={feedback.rating} size={24} />
          </Field>

          <Field label="Category">
            <CategoryBadge
              category={feedback.category}
              getCategoryColor={getCategoryColor}
            />
          </Field>

          <Field label="Submitted">{formatDate(feedback.timestamp)}</Field>

          <Field label="Message">{feedback.message}</Field>
        </div>

        <div className="p-6 flex gap-3">
          <button
            onClick={close}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

          <button
            className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-600 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            onClick={() => {
              setDeleteModal({
                isOpen: true,
                feedbackId: feedback.id,
                feedbackUid: feedback.uid,
              });
              close();
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

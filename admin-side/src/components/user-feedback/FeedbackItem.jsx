import { Calendar, MessageSquare, Trash2 } from 'lucide-react';
import StarRating from './StarRating';
import CategoryBadge from './CategoryBadge';

export default function FeedbackItem({
  fb,
  formatDate,
  getCategoryColor,
  setSelectedFeedback,
  setDeleteModal,
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <div className="flex justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
            {fb.name?.charAt(0)}
          </div>

          <div>
            <h3 className="font-bold">{fb.name}</h3>
            <p className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" /> {formatDate(fb.timestamp)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="p-2 bg-blue-50 rounded-lg"
            onClick={() => setSelectedFeedback(fb)}
          >
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </button>

          <button
            className="p-2 bg-red-50 rounded-lg"
            onClick={() =>
              setDeleteModal({
                isOpen: true,
                feedbackId: fb.id,
                feedbackUid: fb.uid,
              })
            }
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <StarRating value={fb.rating} />
        <CategoryBadge
          category={fb.category}
          getCategoryColor={getCategoryColor}
        />
      </div>

      <p className="mt-3 text-gray-800">{fb.message}</p>
    </div>
  );
}

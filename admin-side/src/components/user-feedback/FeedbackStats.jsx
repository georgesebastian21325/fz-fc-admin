import { Star, MessageSquare, Filter } from 'lucide-react';

export default function FeedbackStats({ stats, filteredCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        title="Total Feedback"
        value={stats.total}
        color="from-green-600 to-green-500"
      />

      <StatCard
        icon={<Star className="w-6 h-6 text-white" />}
        title="Average Rating"
        value={stats.avgRating}
        color="from-yellow-500 to-orange-500"
      />

      <StatCard
        icon={<Filter className="w-6 h-6 text-white" />}
        title="Filtered Results"
        value={filteredCount}
        color="from-blue-600 to-blue-500"
      />
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border flex items-center gap-3">
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

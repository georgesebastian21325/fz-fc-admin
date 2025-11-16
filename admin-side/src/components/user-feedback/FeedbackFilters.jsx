import { Search, Filter } from 'lucide-react';

export default function FeedbackFilters({
  searchQuery,
  setSearchQuery,
  filterRating,
  setFilterRating,
  filterCategory,
  setFilterCategory,
  categories,
  showFilters,
  setShowFilters,
}) {
  return (
    <div className="bg-white p-4 rounded-xl shadow mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold">Rating</label>
            <select
              className="w-full p-2 mt-2 border rounded-lg"
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Category</label>
            <select
              className="w-full p-2 mt-2 border rounded-lg"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

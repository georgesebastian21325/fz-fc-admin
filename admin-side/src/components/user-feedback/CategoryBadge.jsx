export default function CategoryBadge({ category, getCategoryColor }) {
  return (
    <span
      className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getCategoryColor(
        category
      )}`}
    >
      {category || 'Uncategorized'}
    </span>
  );
}

export default function ListPagination({ page, hasMore, onPrev, onNext, loading }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 bg-gray-50">
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1 || loading}
        className="text-xs font-semibold text-wa-dark disabled:text-gray-300 disabled:cursor-not-allowed hover:text-wa-green transition-colors"
      >
        Previous
      </button>
      <span className="text-xs text-gray-500">Page {page}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={!hasMore || loading}
        className="text-xs font-semibold text-wa-dark disabled:text-gray-300 disabled:cursor-not-allowed hover:text-wa-green transition-colors"
      >
        Next
      </button>
    </div>
  );
}

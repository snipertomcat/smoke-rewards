import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  lastPage: number
  from: number | null
  to: number | null
  total: number
  onPrev: () => void
  onNext: () => void
}

export default function Pagination({
  currentPage,
  lastPage,
  from,
  to,
  total,
  onPrev,
  onNext,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      <p className="text-sm text-gray-600">
        {from !== null && to !== null ? (
          <>
            Showing <span className="font-medium">{from}</span>–
            <span className="font-medium">{to}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </>
        ) : (
          <>No results</>
        )}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600">
          {currentPage} / {lastPage}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage >= lastPage}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function ErrorMessage({ message, onRetry }: { message: string, onRetry?: () => void }) {
  return (
    <div className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center justify-between text-error">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-error/20 rounded-lg hover:bg-error/30 transition-colors text-sm font-medium">
          Retry
        </button>
      )}
    </div>
  )
}
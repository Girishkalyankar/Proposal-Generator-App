"use client"

export default function ViewError({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold">Loading proposal...</h2>
        <p className="text-muted-foreground">The server is waking up. Please try again.</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

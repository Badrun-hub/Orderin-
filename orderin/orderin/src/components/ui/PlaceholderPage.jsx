export default function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="bg-surface-container rounded-2xl p-8 text-center max-w-sm w-full ghost-border">
        <h1 className="text-xl font-bold font-headline mb-2">{title}</h1>
        <p className="text-on-surface-variant text-sm">Halaman ini sedang dalam tahap pengembangan.</p>
      </div>
    </div>
  )
}

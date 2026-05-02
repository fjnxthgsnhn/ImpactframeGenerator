import { ImageDropZone } from "@/components/image-drop-zone";

function App() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <header className="border-b border-outline-variant px-6 py-4">
        <h1 className="text-heading-md font-bold tracking-tight">
          Impact Frame Generator
        </h1>
      </header>
      <main className="mx-auto max-w-4xl space-y-8 p-6">
        <section>
          <h2 className="mb-4 text-heading-md font-semibold">画像入力</h2>
          <ImageDropZone />
        </section>
      </main>
    </div>
  );
}

export default App;
import { ImageDropZone } from "@/components/image-drop-zone";
import { AnchorOverlay } from "@/components/anchor-overlay";
import { PresetSelector } from "@/components/preset-selector";
import { GeneratePanel } from "@/components/generate-panel";
import { useAppStore } from "@/stores/use-app-store";

function App() {
  const previewDataUrl = useAppStore((s) => s.image.previewDataUrl);

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

        {previewDataUrl && (
          <>
            <section>
              <h2 className="mb-4 text-heading-md font-semibold">
                中心点の指定
              </h2>
              <AnchorOverlay />
            </section>

            <section>
              <PresetSelector />
            </section>

            <section>
              <GeneratePanel />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;

import {
  useCallback,
  useRef,
  useState,
  useEffect,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useAppStore } from "@/stores/use-app-store";
import { displayToInternal, internalToDisplay } from "@/lib/canvas/coordinate-transform";
import type { AnchorMode } from "@/types";

const MODE_LABELS: Record<AnchorMode, string> = {
  auto: "自動",
  face: "顔",
  person: "人物",
  object: "物体",
  foreground: "前景",
  manual: "手動",
  center: "中央",
};

const SOURCE_ICONS: Record<string, string> = {
  face: "👤",
  person: "🧍",
  object: "📦",
  foreground: "🎯",
  center: "⊕",
  manual: "✋",
};

export function AnchorOverlay() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const previewDataUrl = useAppStore((s) => s.image.previewDataUrl);
  const anchor = useAppStore((s) => s.anchor);
  const anchorMode = useAppStore((s) => s.anchorMode);
  const isAnchorLocked = useAppStore((s) => s.isAnchorLocked);
  const setAnchor = useAppStore((s) => s.setAnchor);
  const setAnchorMode = useAppStore((s) => s.setAnchorMode);
  const setAnchorLocked = useAppStore((s) => s.setAnchorLocked);

  // コンテナサイズの監視
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getEventPos = useCallback(
    (e: ReactMouseEvent): { x: number; y: number } => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [],
  );

  const handleClick = useCallback(
    (e: ReactMouseEvent) => {
      if (isAnchorLocked) return;
      const pos = getEventPos(e);
      const internal = displayToInternal(
        pos.x,
        pos.y,
        containerSize.width,
        containerSize.height,
      );
      setAnchor({
        x: internal.x,
        y: internal.y,
        confidence: 1.0,
        source: "manual",
      });
      setAnchorMode("manual");
    },
    [
      isAnchorLocked,
      getEventPos,
      containerSize,
      setAnchor,
      setAnchorMode,
    ],
  );

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent) => {
      if (isAnchorLocked) return;
      setIsDragging(true);
      const pos = getEventPos(e);
      const internal = displayToInternal(
        pos.x,
        pos.y,
        containerSize.width,
        containerSize.height,
      );
      setAnchor({
        x: internal.x,
        y: internal.y,
        confidence: 1.0,
        source: "manual",
      });
      setAnchorMode("manual");
    },
    [
      isAnchorLocked,
      getEventPos,
      containerSize,
      setAnchor,
      setAnchorMode,
    ],
  );

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent) => {
      if (!isDragging) return;
      const pos = getEventPos(e);
      const internal = displayToInternal(
        pos.x,
        pos.y,
        containerSize.width,
        containerSize.height,
      );
      setAnchor({
        x: internal.x,
        y: internal.y,
        confidence: 1.0,
        source: "manual",
      });
    },
    [isDragging, getEventPos, containerSize, setAnchor],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleLock = useCallback(() => {
    setAnchorLocked(!isAnchorLocked);
  }, [isAnchorLocked, setAnchorLocked]);

  // 表示座標でのアンカー位置
  const displayAnchor = anchor
    ? internalToDisplay(
        anchor.x,
        anchor.y,
        containerSize.width,
        containerSize.height,
      )
    : null;

  if (!previewDataUrl) return null;

  return (
    <div className="space-y-3">
      {/* アンカー表示付き画像プレビュー */}
      <div
        ref={containerRef}
        className="relative cursor-crosshair overflow-hidden rounded-lg border border-outline-variant select-none"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="img"
        aria-label="中心点指定エリア"
      >
        <img
          src={previewDataUrl}
          alt="プレビュー"
          className="w-full"
          style={{ aspectRatio: "16/9" }}
          draggable={false}
        />

        {/* アンカーマーカー */}
        {displayAnchor && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: displayAnchor.x,
              top: displayAnchor.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* 外側の円 */}
            <div
              className={`rounded-full border-2 ${
                isAnchorLocked
                  ? "border-error"
                  : "border-primary"
              }`}
              style={{
                width: 24,
                height: 24,
                backgroundColor: isAnchorLocked
                  ? "rgb(var(--color-error) / 0.15)"
                  : "rgb(var(--color-primary) / 0.15)",
              }}
            />
            {/* 中心点 */}
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                isAnchorLocked ? "bg-error" : "bg-primary"
              }`}
              style={{ width: 4, height: 4 }}
            />
          </div>
        )}

        {/* ドラッグ中インジケーター */}
        {isDragging && (
          <div className="absolute top-2 left-2 rounded bg-surface-container-high px-2 py-1 text-xs text-on-surface">
            ドラッグ中...
          </div>
        )}
      </div>

      {/* 操作パネル */}
      <div className="flex flex-wrap items-center gap-2">
        {/* アンカーモード表示 */}
        <div className="flex items-center gap-1.5 rounded-md bg-surface-container px-3 py-1.5 text-xs text-on-surface-variant">
          <span>{SOURCE_ICONS[anchor?.source ?? "center"]}</span>
          <span>{MODE_LABELS[anchorMode]}</span>
          {anchor && (
            <span className="font-mono text-on-surface">
              ({anchor.x.toFixed(0)}, {anchor.y.toFixed(0)})
            </span>
          )}
        </div>

        {/* ロックボタン */}
        <button
          onClick={toggleLock}
          className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
            isAnchorLocked
              ? "bg-error-container text-on-error-container"
              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
          }`}
          type="button"
        >
          {isAnchorLocked ? "🔒 ロック中" : "🔓 ロック"}
        </button>

        {/* 中央にリセット */}
        <button
          onClick={() => {
            if (isAnchorLocked) return;
            setAnchor({
              x: 960,
              y: 540,
              confidence: 1.0,
              source: "center",
            });
            setAnchorMode("center");
          }}
          className="rounded-md bg-surface-container-high px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          type="button"
        >
          中央にリセット
        </button>

        <span className="text-xs text-on-surface-variant">
          クリックで中心点を指定 / ドラッグで移動
        </span>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import type { FamilyTreeNode, NodeStatusColor } from "@/lib/data/family-tree";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const STATUS_STYLES: Record<NodeStatusColor, { fill: string; stroke: string }> = {
  white: { fill: "#ffffff", stroke: "#cbd3d0" },
  green: { fill: "#b0d5c8", stroke: "#286e62" },
  yellow: { fill: "#eedabe", stroke: "#c99a5d" },
  lightblue: { fill: "#dceefb", stroke: "#3b82f6" },
};

const NODE_WIDTH = 120;
const NODE_HEIGHT = 56;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.2;
const ZOOM_DEFAULT = 1;
// Landing zoom for the signed-in member: the closest the view allows, so the
// card is as large as it can get. Follows ZOOM_MAX if that limit ever changes.
const ZOOM_FOCUS = ZOOM_MAX;

const LEGEND_ITEMS: { color: NodeStatusColor; label: string }[] = [
  { color: "green", label: "على قيد الحياة، وله أبناء" },
  { color: "lightblue", label: "على قيد الحياة، بدون أبناء" },
  { color: "white", label: "متوفى، وله أبناء" },
  { color: "yellow", label: "متوفى، بدون أبناء" },
];

function FamilyTreeNodeElement({
  nodeDatum,
  toggleNode,
  onNodeClick,
  isSelf,
}: CustomNodeElementProps & { isSelf: boolean }) {
  const data = nodeDatum as unknown as FamilyTreeNode;
  const { fill, stroke } = STATUS_STYLES[data.statusColor] ?? STATUS_STYLES.white;

  return (
    <g
      data-self-node={isSelf ? "true" : undefined}
      onClick={(evt) => {
        toggleNode();
        onNodeClick(evt);
      }}
      style={{ cursor: "pointer" }}
    >
      {isSelf && (
        <rect
          x={-NODE_WIDTH / 2 - 5}
          y={-NODE_HEIGHT / 2 - 5}
          width={NODE_WIDTH + 10}
          height={NODE_HEIGHT + 10}
          rx={14}
          fill="none"
          stroke="#286e62"
          strokeWidth={2.5}
        />
      )}
      <rect
        x={-NODE_WIDTH / 2}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text textAnchor="middle" y={-4} fontSize={13} fontWeight={400} fill="#1a2220">
        {data.firstName}
      </text>
      <text textAnchor="middle" y={16} fontSize={11} fill="#4a524f">
        {data.yearRange}
      </text>
    </g>
  );
}

export function FamilyTreeView({
  data,
  selfNodeId,
}: {
  data: FamilyTreeNode[];
  selfNodeId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<RawNodeDatum | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 80 });
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  // react-d3-tree keeps its own pan/zoom internally and only reads these props
  // when they change, so the live transform is mirrored into a ref rather than
  // state: writing it to state on every pan would re-render mid-gesture.
  const liveTransformRef = useRef({ x: 0, y: 80, k: ZOOM_DEFAULT });
  const hasFocusedRef = useRef(false);

  /** Mirrors the transform actually applied, so later moves start from truth. */
  const setView = (next: { x: number; y: number }, nextZoom: number) => {
    liveTransformRef.current = { x: next.x, y: next.y, k: nextZoom };
    setTranslate(next);
    setZoom(nextZoom);
  };

  /** Rescales around the viewport centre so zooming keeps the current pan. */
  const applyZoom = (next: number) => {
    const container = containerRef.current;
    const live = liveTransformRef.current;
    if (!container || live.k <= 0) {
      setZoom(next);
      return;
    }
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const ratio = next / live.k;
    setView(
      { x: cx - (cx - live.x) * ratio, y: cy - (cy - live.y) * ratio },
      next
    );
  };

  const zoomIn = () => applyZoom(Math.min(ZOOM_MAX, +(zoom + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => applyZoom(Math.max(ZOOM_MIN, +(zoom - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => applyZoom(ZOOM_DEFAULT);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateTranslate = () => {
      // Once the view has been focused, a resize must not yank it back to the
      // root — that would undo wherever the member has panned to.
      if (hasFocusedRef.current) return;
      setTranslate({ x: node.clientWidth / 2, y: 80 });
    };

    updateTranslate();
    const observer = new ResizeObserver(updateTranslate);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Positions the view once, after react-d3-tree has laid the nodes out.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasFocusedRef.current) return;

    let frame = 0;
    let lastSample: { x: number; y: number } | null = null;
    const deadline = Date.now() + 5000;

    /** The transform react-d3-tree currently has applied to the whole tree. */
    const appliedTransform = () => {
      const g = container.querySelector<SVGGElement>("g.rd3t-g");
      const match = g
        ?.getAttribute("transform")
        ?.match(/translate(s*(-?[d.]+)s*,s*(-?[d.]+)s*)s*scale(s*([d.]+)s*)/);
      return match
        ? { x: Number(match[1]), y: Number(match[2]), k: Number(match[3]) }
        : null;
    };

    /**
     * Centre of the member's node in container pixels, measured from what is
     * actually painted so the real node box — border, padding and all — lands
     * on the viewport centre rather than its layout anchor.
     */
    const measureSelf = () => {
      const marker = container.querySelector<SVGGElement>('[data-self-node="true"]');
      const group = marker?.closest<SVGGElement>("g.rd3t-node, g.rd3t-leaf-node");
      if (!group) return null;
      const nodeBox = group.getBoundingClientRect();
      if (nodeBox.width === 0 && nodeBox.height === 0) return null;
      const containerBox = container.getBoundingClientRect();
      return {
        x: nodeBox.left + nodeBox.width / 2 - containerBox.left,
        y: nodeBox.top + nodeBox.height / 2 - containerBox.top,
      };
    };

    /** Midpoint of every drawn node, in layout units. */
    const treeCenter = () => {
      const g = container.querySelector<SVGGElement>("g.rd3t-g");
      if (!g || g.childNodes.length === 0) return null;
      try {
        const box = g.getBBox();
        if (box.width === 0 && box.height === 0) return null;
        return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
      } catch {
        return null;
      }
    };

    /** Puts a point given in layout units at the centre of the viewport. */
    const centerOnLayoutPoint = (point: { x: number; y: number }, k: number) => {
      hasFocusedRef.current = true;
      setView(
        {
          x: container.clientWidth / 2 - point.x * k,
          y: container.clientHeight / 2 - point.y * k,
        },
        k
      );
    };

    const tick = () => {
      const applied = appliedTransform();
      const sample = selfNodeId && applied ? measureSelf() : null;

      if (sample && applied) {
        // A node first renders at its parent's coordinates and only moves to
        // its own in componentDidMount, so a single reading can be a whole row
        // too high. Accept a position only once it has stopped changing.
        const settled =
          lastSample !== null &&
          Math.abs(lastSample.x - sample.x) < 0.5 &&
          Math.abs(lastSample.y - sample.y) < 0.5;
        lastSample = sample;

        if (settled) {
          centerOnLayoutPoint(
            {
              x: (sample.x - applied.x) / applied.k,
              y: (sample.y - applied.y) / applied.k,
            },
            ZOOM_FOCUS
          );
          return;
        }
      }

      // Either this member has no node linked, or theirs never appeared.
      // Settle on the middle of the tree instead of pinning the view to the root.
      if (!selfNodeId || Date.now() >= deadline) {
        const center = treeCenter();
        if (center) {
          centerOnLayoutPoint(center, ZOOM_DEFAULT);
          return;
        }
      }

      if (Date.now() < deadline) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [selfNodeId, data]);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-sm text-neutral-600">
        لا توجد بيانات لعرض شجرة الأسرة بعد.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div
        ref={containerRef}
        dir="ltr"
        className="relative h-[560px] w-full rounded-2xl border border-neutral-200 bg-white"
      >
        <div className="absolute end-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-neutral-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            aria-label="تكبير"
            onClick={zoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="تصغير"
            onClick={zoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="إعادة ضبط التكبير"
            onClick={zoomReset}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        <Tree
          data={data as RawNodeDatum[]}
          translate={translate}
          zoom={zoom}
          scaleExtent={{ min: ZOOM_MIN, max: ZOOM_MAX }}
          orientation="vertical"
          pathFunc="step"
          collapsible
          zoomable
          separation={{ siblings: 1.2, nonSiblings: 1.6 }}
          nodeSize={{ x: 160, y: 120 }}
          renderCustomNodeElement={(rd3tProps) => (
            <FamilyTreeNodeElement
              {...rd3tProps}
              isSelf={
                Boolean(selfNodeId) &&
                (rd3tProps.nodeDatum as unknown as FamilyTreeNode).id === selfNodeId
              }
            />
          )}
          onNodeClick={(nodeDatum) => setSelected(nodeDatum.data)}
          onUpdate={({ zoom: liveZoom, translate: liveTranslate }) => {
            liveTransformRef.current = {
              x: liveTranslate.x,
              y: liveTranslate.y,
              k: liveZoom,
            };
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.color} className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span
              className="h-3 w-3 shrink-0 rounded"
              style={{
                backgroundColor: STATUS_STYLES[item.color].fill,
                border: `1.5px solid ${STATUS_STYLES[item.color].stroke}`,
              }}
            />
            {item.label}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500">
          تفاصيل الفرد
        </h2>
        {selected ? (
          <div>
            <p className="text-lg font-bold text-primary-900">{selected.name}</p>
            {selected.attributes &&
              Object.entries(selected.attributes).map(([key, value]) => (
                <p key={key} className="mt-1 text-sm text-neutral-600">
                  <span className="font-medium text-neutral-800">{key}:</span>{" "}
                  {value}
                </p>
              ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">
            انقر على أي فرد في الشجرة لعرض تفاصيله هنا.
          </p>
        )}
      </div>
    </div>
  );
}

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

const LEGEND_ITEMS: { color: NodeStatusColor; label: string }[] = [
  { color: "green", label: "على قيد الحياة، وله أبناء" },
  { color: "lightblue", label: "على قيد الحياة، بدون أبناء" },
  { color: "white", label: "متوفى، وله أبناء" },
  { color: "yellow", label: "متوفى، بدون أبناء" },
];

function FamilyTreeNodeElement({ nodeDatum, toggleNode, onNodeClick }: CustomNodeElementProps) {
  const data = nodeDatum as unknown as FamilyTreeNode;
  const { fill, stroke } = STATUS_STYLES[data.statusColor] ?? STATUS_STYLES.white;

  return (
    <g
      onClick={(evt) => {
        toggleNode();
        onNodeClick(evt);
      }}
      style={{ cursor: "pointer" }}
    >
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

export function FamilyTreeView({ data }: { data: FamilyTreeNode[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<RawNodeDatum | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 80 });
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
  const zoomReset = () => setZoom(ZOOM_DEFAULT);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateTranslate = () =>
      setTranslate({ x: node.clientWidth / 2, y: 80 });

    updateTranslate();
    const observer = new ResizeObserver(updateTranslate);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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
          renderCustomNodeElement={(rd3tProps) => <FamilyTreeNodeElement {...rd3tProps} />}
          onNodeClick={(nodeDatum) => setSelected(nodeDatum.data)}
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

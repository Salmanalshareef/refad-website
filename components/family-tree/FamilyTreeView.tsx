"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Minus, Plus, RotateCcw, User } from "lucide-react";
import type { CustomNodeElementProps, RawNodeDatum } from "react-d3-tree";
import { cn } from "@/lib/utils";
import type { FamilyTreeNode, NodeStatusColor } from "@/lib/data/family-tree";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

// Colours live in globals.css keyed by these classes. They are not inline
// styles because an unresolved var() on an SVG node silently inherits
// react-d3-tree own .rd3t-node { fill: #777 }, which is invisible on a dark
// card. The same class also paints the legend swatch beside the tree.
const STATUS_CLASS: Record<NodeStatusColor, string> = {
  white: "tree-status-white",
  green: "tree-status-green",
  yellow: "tree-status-yellow",
  lightblue: "tree-status-blue",
};

const NODE_WIDTH = 150;
const NODE_HEIGHT = 78;
// Avatar geometry for cards that have a photo: seated on the top edge so it
// straddles the card, the way an org chart places a portrait. The card keeps
// its size and the text drops instead, so rows stay aligned either way.
const AVATAR_RADIUS = 26;
const AVATAR_CY = -NODE_HEIGHT / 2;
// Matches the placeholder MemberPhoto shows for a board member with no photo:
// the same lucide glyph at half the circle, on the same tinted ground.
const AVATAR_ICON_SIZE = AVATAR_RADIUS;
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
  const statusClass = STATUS_CLASS[data.statusColor] ?? STATUS_CLASS.white;
  // Ids must be unique per node: a clipPath is referenced document-wide.
  const clipId = `tree-avatar-${data.id}`;
  const hasPhoto = Boolean(data.photoUrl);

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
          className="tree-self-ring"
          style={{ fill: "none" }}
          strokeWidth={2.5}
        />
      )}
      <rect
        x={-NODE_WIDTH / 2}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        className={statusClass}
        strokeWidth={1.5}
      />
      {/* Opaque backing: the half above the card would otherwise sit on the
          link line coming down from the parent. */}
      <circle
        cx={0}
        cy={AVATAR_CY}
        r={AVATAR_RADIUS}
        className={hasPhoto ? statusClass : "tree-avatar-plate"}
      />

      {hasPhoto ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <circle cx={0} cy={AVATAR_CY} r={AVATAR_RADIUS} />
            </clipPath>
          </defs>
          <image
            href={data.photoUrl ?? undefined}
            x={-AVATAR_RADIUS}
            y={AVATAR_CY - AVATAR_RADIUS}
            width={AVATAR_RADIUS * 2}
            height={AVATAR_RADIUS * 2}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </>
      ) : (
        <User
          className="tree-avatar-ink"
          x={-AVATAR_ICON_SIZE / 2}
          y={AVATAR_CY - AVATAR_ICON_SIZE / 2}
          width={AVATAR_ICON_SIZE}
          height={AVATAR_ICON_SIZE}
        />
      )}

      <circle
        cx={0}
        cy={AVATAR_CY}
        r={AVATAR_RADIUS}
        className={statusClass}
        style={{ fill: "none" }}
        strokeWidth={1.5}
      />

      <text
        className="tree-node-name"
        textAnchor="middle"
        y={10}
        fontSize={15}
        fontWeight={500}
      >
        {data.firstName}
      </text>
      <text className="tree-node-years" textAnchor="middle" y={29} fontSize={12}>
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

  // Drives the view onto the signed-in member once the tree is laid out.
  //
  // react-d3-tree computes its layout internally and never exposes node
  // coordinates, and a node is first painted at its parent position before
  // componentDidMount moves it to its own. Rather than trust a single reading,
  // this measures where the node actually is, corrects, then measures again,
  // until the node sits on the centre for several consecutive frames.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || hasFocusedRef.current) return;

    let frame = 0;
    let corrections = 0;
    let onTargetFrames = 0;
    let finished = false;
    const deadline = Date.now() + 20000;

    const stop = () => {
      finished = true;
      cancelAnimationFrame(frame);
      container.removeEventListener("pointerdown", stop);
      container.removeEventListener("wheel", stop);
    };

    // Any deliberate interaction wins; never fight the member for the view.
    container.addEventListener("pointerdown", stop);
    container.addEventListener("wheel", stop);

    /** The SVG is the coordinate space the tree transform is expressed in. */
    const svgEl = () => container.querySelector<SVGSVGElement>("svg.rd3t-svg");

    /** The transform react-d3-tree currently has applied to the whole tree. */
    const appliedTransform = () => {
      const g = container.querySelector<SVGGElement>("g.rd3t-g");
      const match = g
        ?.getAttribute("transform")
        ?.match(/translate\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*scale\(\s*([\d.]+)\s*\)/);
      return match
        ? { x: Number(match[1]), y: Number(match[2]), k: Number(match[3]) }
        : null;
    };

    /**
     * Centre of the member node in SVG pixels, taken from the painted box so
     * the real card - stroke, ring and all - is what gets centred.
     */
    const measureSelf = (svg: SVGSVGElement) => {
      const marker = container.querySelector<SVGGElement>(`[data-self-node="true"]`);
      const group = marker?.closest<SVGGElement>("g.rd3t-node, g.rd3t-leaf-node");
      if (!group) return null;
      const nodeBox = group.getBoundingClientRect();
      if (nodeBox.width === 0 && nodeBox.height === 0) return null;
      const svgBox = svg.getBoundingClientRect();
      return {
        x: nodeBox.left + nodeBox.width / 2 - svgBox.left,
        y: nodeBox.top + nodeBox.height / 2 - svgBox.top,
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

    const step = () => {
      if (finished) return;

      const svg = svgEl();
      const applied = appliedTransform();
      const sample = svg && selfNodeId ? measureSelf(svg) : null;

      if (svg && applied && sample) {
        const svgBox = svg.getBoundingClientRect();
        const targetX = svgBox.width / 2;
        const targetY = svgBox.height / 2;
        const offBy = Math.max(Math.abs(targetX - sample.x), Math.abs(targetY - sample.y));
        const atZoom = Math.abs(applied.k - ZOOM_FOCUS) < 0.001;

        // Stop only once it has held the centre for a few frames, so a node
        // that is still settling into place cannot end the loop early.
        if (offBy < 1 && atZoom) {
          onTargetFrames += 1;
          if (onTargetFrames >= 3) {
            hasFocusedRef.current = true;
            stop();
            return;
          }
          frame = requestAnimationFrame(step);
          return;
        }

        onTargetFrames = 0;

        if (corrections < 40) {
          corrections += 1;
          // Freeze the resize handler now: from here the view is ours.
          hasFocusedRef.current = true;
          const layoutX = (sample.x - applied.x) / applied.k;
          const layoutY = (sample.y - applied.y) / applied.k;
          setView(
            { x: targetX - layoutX * ZOOM_FOCUS, y: targetY - layoutY * ZOOM_FOCUS },
            ZOOM_FOCUS
          );
          frame = requestAnimationFrame(step);
          return;
        }
      }

      // No node to focus, or it never appeared: settle on the middle of the
      // tree rather than leaving the view pinned to the root.
      if (!hasFocusedRef.current && (!selfNodeId || Date.now() >= deadline)) {
        const center = treeCenter();
        if (center && svg) {
          const svgBox = svg.getBoundingClientRect();
          hasFocusedRef.current = true;
          setView(
            {
              x: svgBox.width / 2 - center.x * ZOOM_DEFAULT,
              y: svgBox.height / 2 - center.y * ZOOM_DEFAULT,
            },
            ZOOM_DEFAULT
          );
          stop();
          return;
        }
      }

      if (Date.now() < deadline) {
        frame = requestAnimationFrame(step);
      } else {
        stop();
      }
    };

    frame = requestAnimationFrame(step);
    return stop;
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
        className="tree-canvas relative h-[560px] w-full rounded-2xl border border-neutral-200"
      >
        <div className="absolute end-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 shadow-sm">
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
          nodeSize={{ x: 200, y: 150 }}
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

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.color} className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span
              className={cn("h-3 w-3 shrink-0 rounded border-[1.5px]", STATUS_CLASS[item.color])}
            />
            {item.label}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
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

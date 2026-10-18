"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Minus, Plus, RotateCcw, Search, User, X } from "lucide-react";
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
  pink: "tree-status-pink",
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

/** How long an on-demand focus keeps correcting before it gives up. */
const FOCUS_TIMEOUT_MS = 4000;
const SEARCH_RESULT_LIMIT = 8;

/* ── Reading the tree out of the DOM ────────────────────────────────────────
   react-d3-tree computes its layout internally and never exposes a node's
   coordinates, so the only way to centre one is to measure where it was
   actually painted. These read that; the loops that use them live below. */

const svgOf = (container: HTMLElement) =>
  container.querySelector<SVGSVGElement>("svg.rd3t-svg");

/** The transform react-d3-tree currently has applied to the whole tree. */
const appliedTransformOf = (container: HTMLElement) => {
  const g = container.querySelector<SVGGElement>("g.rd3t-g");
  const match = g
    ?.getAttribute("transform")
    ?.match(/translate\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*scale\(\s*([\d.]+)\s*\)/);
  return match
    ? { x: Number(match[1]), y: Number(match[2]), k: Number(match[3]) }
    : null;
};

/**
 * Centre of a node in SVG pixels, taken from the painted box so the real card
 * — stroke, ring and all — is what gets centred.
 */
const measureNode = (
  container: HTMLElement,
  svg: SVGSVGElement,
  selector: string
) => {
  const marker = container.querySelector<SVGGElement>(selector);
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
const treeCenterOf = (container: HTMLElement) => {
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

/**
 * Folds the spellings that differ only in writing, so searching for "عبدالله"
 * finds "عبداللّٰه" and "احمد" finds "أحمد". Members type the plain forms;
 * the records were entered by many different hands over the years.
 */
const normalizeArabic = (value: string) =>
  value
    .replace(/[ً-ْـٰ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ؤئ]/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Matching form: the above with the spaces taken out too.
 *
 * "عبد الله" and "عبدالله" are the same name written two ways, and both are
 * in the records. Comparing without spaces means whichever way a member types
 * it finds both, at the cost of a query occasionally spanning a word boundary
 * — a fair trade when the alternative is finding nobody.
 */
const searchKey = (value: string) => normalizeArabic(value).replace(/ /g, "");

const LEGEND_ITEMS: { color: NodeStatusColor; label: string }[] = [
  { color: "green", label: "على قيد الحياة، وله أبناء" },
  { color: "lightblue", label: "على قيد الحياة، بدون أبناء" },
  { color: "white", label: "متوفى، وله أبناء" },
  { color: "yellow", label: "متوفى، بدون أبناء" },
];

function FamilyTreeNodeElement({
  nodeDatum,
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
      data-node-id={data.id}
      data-self-node={isSelf ? "true" : undefined}
      onClick={onNodeClick}
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
        // 600 rather than 500: the labels used to be stroked, and losing that
        // outline cost them apparent weight. Cairo 600 is already loaded.
        fontWeight={600}
      >
        {data.firstName}
      </text>
      <text
        className="tree-node-years"
        textAnchor="middle"
        y={29}
        fontSize={12}
        fontWeight={500}
      >
        {data.yearRange}
      </text>

    </g>
  );
}

/**
 * Finds a member by name and hands the id back.
 *
 * The tree draws every member at once, so with two hundred of them the only
 * way to reach someone used to be panning until you spotted them. Searching
 * goes straight there.
 */
function TreeSearch({
  members,
  onPick,
}: {
  members: FamilyTreeNode[];
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  // Normalised once per member rather than once per keystroke.
  const haystack = useMemo(
    () => members.map((m) => ({ member: m, search: searchKey(m.name) })),
    [members]
  );

  const results = useMemo(() => {
    const needle = searchKey(query);
    if (needle.length < 2) return [];
    return haystack
      .filter((entry) => entry.search.includes(needle))
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((entry) => entry.member);
  }, [haystack, query]);

  const pick = (id: string) => {
    onPick(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="search"
          value={query}
          placeholder="ابحث عن فرد بالاسم..."
          aria-label="ابحث عن فرد في الشجرة"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            // Enter takes the top match, which is the whole interaction when
            // the name typed is already unambiguous.
            if (event.key === "Enter" && results[0]) {
              event.preventDefault();
              pick(results[0].id);
            }
          }}
          className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pe-4 ps-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        {query && (
          <button
            type="button"
            aria-label="مسح البحث"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && searchKey(query).length >= 2 && (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-neutral-500">
              لا يوجد فرد بهذا الاسم.
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => pick(member.id)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-start text-sm hover:bg-primary-50"
                  >
                    <span className="min-w-0 truncate text-neutral-800">
                      {member.name}
                    </span>
                    {member.yearRange && (
                      <span dir="ltr" className="shrink-0 text-xs text-neutral-500">
                        {member.yearRange}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
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
  // The id rather than the node: the panel wants the member's relatives too,
  // and the index below is what knows who those are.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 80 });
  const [zoom, setZoom] = useState(ZOOM_DEFAULT);

  // Every member by id, flattened out of the tree once. Search reads the
  // values; selection reads one by id.
  const index = useMemo(() => {
    const map = new Map<string, FamilyTreeNode>();
    const walk = (node: FamilyTreeNode) => {
      map.set(node.id, node);
      node.children?.forEach(walk);
    };
    data.forEach(walk);
    return map;
  }, [data]);

  const members = useMemo(() => [...index.values()], [index]);
  const selectedNode = (selectedId ? index.get(selectedId) : null) ?? null;

  // react-d3-tree keeps its own pan/zoom internally and only reads these props
  // when they change, so the live transform is mirrored into a ref rather than
  // state: writing it to state on every pan would re-render mid-gesture.
  const liveTransformRef = useRef({ x: 0, y: 80, k: ZOOM_DEFAULT });
  const hasFocusedRef = useRef(false);
  /** The in-flight on-demand focus, so a second request cancels the first. */
  const focusFrameRef = useRef(0);

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

  /**
   * Drives the view onto one member and selects them.
   *
   * Same closed loop as the landing focus below: measure where the card was
   * actually painted, correct, measure again, and stop only once it has held
   * the centre for a few frames. A single correction is not enough because the
   * tree may still be settling when the first reading is taken.
   *
   * Unlike the landing focus this is something the member asked for, so it
   * runs on a short deadline and only a pan or a wheel cancels it.
   */
  const focusOnNode = (nodeId: string) => {
    const container = containerRef.current;
    if (!container) return;

    setSelectedId(nodeId);
    cancelAnimationFrame(focusFrameRef.current);

    const selector = `[data-node-id="${CSS.escape(nodeId)}"]`;
    const deadline = Date.now() + FOCUS_TIMEOUT_MS;
    let corrections = 0;
    let onTargetFrames = 0;

    const stop = () => {
      cancelAnimationFrame(focusFrameRef.current);
      container.removeEventListener("pointerdown", stop);
      container.removeEventListener("wheel", stop);
    };

    // The click that asked for this already fired its pointerdown, so these
    // only catch what the member does next.
    container.addEventListener("pointerdown", stop);
    container.addEventListener("wheel", stop);

    const step = () => {
      const svg = svgOf(container);
      const applied = appliedTransformOf(container);
      const sample = svg ? measureNode(container, svg, selector) : null;

      if (svg && applied && sample) {
        const svgBox = svg.getBoundingClientRect();
        const targetX = svgBox.width / 2;
        const targetY = svgBox.height / 2;
        const offBy = Math.max(Math.abs(targetX - sample.x), Math.abs(targetY - sample.y));

        if (offBy < 1 && Math.abs(applied.k - ZOOM_FOCUS) < 0.001) {
          onTargetFrames += 1;
          if (onTargetFrames >= 3) {
            stop();
            return;
          }
        } else {
          onTargetFrames = 0;
          if (corrections < 40) {
            corrections += 1;
            // The view is ours now; stop the resize handler re-centring.
            hasFocusedRef.current = true;
            const layoutX = (sample.x - applied.x) / applied.k;
            const layoutY = (sample.y - applied.y) / applied.k;
            setView(
              { x: targetX - layoutX * ZOOM_FOCUS, y: targetY - layoutY * ZOOM_FOCUS },
              ZOOM_FOCUS
            );
          }
        }
      }

      if (Date.now() < deadline) {
        focusFrameRef.current = requestAnimationFrame(step);
      } else {
        stop();
      }
    };

    focusFrameRef.current = requestAnimationFrame(step);
  };

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

    // A touch that travels is a drag; a tap is not.
    let touchStart: { x: number; y: number } | null = null;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" || !event.buttons) return;
      if (!touchStart) {
        touchStart = { x: event.clientX, y: event.clientY };
        return;
      }
      const moved =
        Math.abs(event.clientX - touchStart.x) + Math.abs(event.clientY - touchStart.y);
      if (moved > 12) stop();
    };

    const stop = () => {
      finished = true;
      cancelAnimationFrame(frame);
      container.removeEventListener("pointerdown", stopOnDrag);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("wheel", stop);
    };

    // Any deliberate interaction wins; never fight the member for the view.
    // A touch only counts once it becomes a drag: on a phone the centring is
    // still converging when the first stray tap lands, and aborting on that
    // would leave the member wherever the tree happened to be.
    const stopOnDrag = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      stop();
    };
    container.addEventListener("pointerdown", stopOnDrag);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("wheel", stop);

    const step = () => {
      if (finished) return;

      const svg = svgOf(container);
      const applied = appliedTransformOf(container);
      const sample =
        svg && selfNodeId ? measureNode(container, svg, `[data-self-node="true"]`) : null;

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
        const center = treeCenterOf(container);
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
      <TreeSearch members={members} onPick={focusOnNode} />

      <div
        ref={containerRef}
        dir="ltr"
        className="tree-canvas relative h-[420px] w-full rounded-2xl border border-neutral-200 sm:h-[560px]"
      >
        <div className="absolute end-3 top-3 z-10 flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-1 shadow-sm">
          <button
            type="button"
            aria-label="تكبير"
            onClick={zoomIn}
            className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 sm:h-8 sm:w-8"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="تصغير"
            onClick={zoomOut}
            className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 sm:h-8 sm:w-8"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="إعادة ضبط التكبير"
            onClick={zoomReset}
            className="flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 sm:h-8 sm:w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          {/* Only for a member whose account is linked to a card. Panning a
              two-hundred-node tree is easy to get lost in, and this is the way
              back. */}
          {selfNodeId && (
            <button
              type="button"
              aria-label="العودة إلى بطاقتي"
              title="العودة إلى بطاقتي"
              onClick={() => focusOnNode(selfNodeId)}
              className="flex h-11 w-11 items-center justify-center rounded-md border-t border-neutral-200 text-primary-700 hover:bg-neutral-100 sm:h-8 sm:w-8"
            >
              <Crosshair className="h-4 w-4" />
            </button>
          )}
        </div>

        <Tree
          data={data as RawNodeDatum[]}
          translate={translate}
          zoom={zoom}
          scaleExtent={{ min: ZOOM_MIN, max: ZOOM_MAX }}
          orientation="vertical"
          pathFunc="step"
          collapsible={false}
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
          onNodeClick={(nodeDatum) =>
            setSelectedId((nodeDatum.data as unknown as FamilyTreeNode).id)
          }
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
        {selectedNode ? (
          <div>
            <p className="text-lg font-bold text-primary-900">{selectedNode.name}</p>
            {selectedNode.attributes &&
              Object.entries(selectedNode.attributes).map(([key, value]) => (
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

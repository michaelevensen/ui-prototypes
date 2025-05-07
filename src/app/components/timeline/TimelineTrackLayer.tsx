import { useDraggable } from "@dnd-kit/core";
import { Layer } from "./types";
import { useTimeline } from "./TimelineContext";
import { useDrag } from "@use-gesture/react";

type TimelineTrackLayerProps = {
    layer: Layer;
    onResize: (start: number, end: number, direction: "left" | "right") => void;
};

export const TimelineTrackLayer = ({
    layer,
    onResize,
}: TimelineTrackLayerProps) => {
    const { scale } = useTimeline();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: layer.id,
    });

    const handleResize = (delta: number, position: DragHandlePosition) => {
        if (position === "start") {
            onResize(layer.start + delta, layer.end, "left");
        } else {
            onResize(layer.start, layer.end + delta, "right");
        }
    };

    const style = {
        // position: "absolute" as const,
        width: (layer.end - layer.start) * scale,
        transform: transform
            ? `translate3d(${transform.x + layer.start * scale}px, ${
                  transform.y
              }px, 0)`
            : `translate3d(${layer.start * scale}px, 0px, 0)`,
    };

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="absolute top-1/2 -translate-y-1/2 h-20 bg-blue-500 text-white rounded shadow flex justify-between items-center cursor-move z-50"
            style={style}
        >
            <DragHandle position="start" onResize={handleResize} />
            <span className="text-xs">{layer.start.toFixed(0)}</span>
            <span className="font-mono text-xs capitalize select-none truncate">
                {layer.id}
            </span>
            <span className="text-xs flex-end">{layer.end.toFixed(0)}</span>
            <DragHandle position="end" onResize={handleResize} />
        </div>
    );
};

type DragHandlePosition = "start" | "end";

type DragHandleProps = {
    position: DragHandlePosition;
    onResize: (delta: number, position: DragHandlePosition) => void;
};

const DragHandle = ({ position, onResize }: DragHandleProps) => {
    const { scale } = useTimeline();

    const resize = useDrag(({ event, down, delta: [dx] }) => {
        event.preventDefault();
        event.stopPropagation();

        if (down) onResize(dx / scale, position);
    });

    return (
        <div
            className="cursor-col-resize w-2 h-full bg-white/20 hover:bg-white/40 touch-none"
            {...resize()}
        />
    );
};

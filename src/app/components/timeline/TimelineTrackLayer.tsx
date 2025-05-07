import { useDraggable } from "@dnd-kit/core";
import { Layer } from "./types";
import { useTimeline } from "./TimelineContext";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";

type TimelineTrackLayerProps = {
    layer: Layer;
    onMouseOver: () => void;
    onMouseLeave: () => void;
    onResize: (start: number, end: number, direction: "left" | "right") => void;
};

export const TimelineTrackLayer = ({
    layer,
    onResize,
    onMouseOver,
    onMouseLeave,
}: TimelineTrackLayerProps) => {
    const { scale } = useTimeline();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: layer.id,
    });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseOver = () => {
        onMouseOver();
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        onMouseLeave();
        setIsHovered(false);
    };

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
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="absolute group border-transparent border-2 hover:border-black/10 top-1/2 -translate-y-1/2 h-20 bg-blue-500 text-white rounded flex items-center cursor-move z-50"
            style={style}
        >
            <div className="absolute inset-0 flex justify-between items-center">
                <DragHandle
                    visible={isHovered}
                    position="start"
                    onResize={handleResize}
                />
                <DragHandle
                    visible={isHovered}
                    position="end"
                    onResize={handleResize}
                />
            </div>
            <div className="relative flex-1 flex justify-between items-center px-2">
                <span className="text-xs">{layer.start.toFixed(0)}</span>
                <span className="font-mono text-xs capitalize select-none truncate">
                    {layer.id}
                </span>
                <span className="text-xs">{layer.end.toFixed(0)}</span>
            </div>
        </div>
    );
};

type DragHandlePosition = "start" | "end";

type DragHandleProps = {
    visible: boolean;
    position: DragHandlePosition;
    onResize: (delta: number, position: DragHandlePosition) => void;
};

const DragHandle = ({
    visible = true,
    position,
    onResize,
}: DragHandleProps) => {
    const { scale } = useTimeline();

    const resize = useDrag(({ event, down, delta: [dx] }) => {
        event.preventDefault();
        event.stopPropagation();

        if (down) onResize(dx / scale, position);
    });

    return (
        <div
            style={{
                opacity: visible ? 1 : 0,
            }}
            className="cursor-col-resize w-[10px] h-full bg-white/20 hover:bg-white/40 touch-none"
            {...resize()}
        />
    );
};

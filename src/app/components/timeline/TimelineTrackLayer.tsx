import { useDraggable } from "@dnd-kit/core";
import { Layer } from "./types";
import { useTimeline } from "./TimelineContext";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";

type TimelineTrackLayerProps = {
    layer: Layer;
    isLoading?: boolean;
    onMouseOver?: () => void;
    onMouseLeave?: () => void;
    onMouseDown?: (x: number, y: number) => void;
    onMouseMove?: (x: number, y: number) => void;
    onResize?: (
        start: number,
        end: number,
        direction: "left" | "right"
    ) => void;
};

export const TimelineTrackLayer = ({
    layer,
    isLoading = false,
    onResize,
    onMouseOver,
    onMouseLeave,
    onMouseMove,
    onMouseDown,
}: TimelineTrackLayerProps) => {
    const { scale, isSplitMode } = useTimeline();
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: layer.id,
        disabled: isSplitMode,
    });
    const [isHovered, setIsHovered] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseDown = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;
        onMouseDown?.(relativeX, relativeY);
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const relativeX = event.clientX - rect.left;
        const relativeY = event.clientY - rect.top;
        onMouseMove?.(relativeX, relativeY);
        setMousePosition({ x: relativeX, y: relativeY });
    };

    const handleMouseOver = () => {
        onMouseOver?.();
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        onMouseLeave?.();
        setIsHovered(false);
    };

    const handleResize = (delta: number, position: DragHandlePosition) => {
        if (position === "start") {
            onResize?.(layer.start + delta, layer.end, "left");
        } else {
            onResize?.(layer.start, layer.end + delta, "right");
        }
    };

    const style = {
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
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className="group px-1 absolute group border-white/20 border top-1/2 -translate-y-1/2 h-full bg-black text-white rounded-[6px] flex items-center cursor-move z-50"
            style={{
                ...style,
                opacity: isLoading ? 0.5 : 1,
            }}
        >
            {/* split cursor */}
            <SplitCursor visible={isSplitMode} position={mousePosition.x} />

            {/* drag handles */}
            <div className="absolute inset-0 flex justify-between items-center z-50">
                <DragHandle
                    visible={isHovered && !isSplitMode}
                    position="start"
                    onResize={handleResize}
                />
                <DragHandle
                    visible={isHovered && !isSplitMode}
                    position="end"
                    onResize={handleResize}
                />
            </div>

            <div className="relative flex-1 flex justify-between items-center px-2">
                <span className="text-xs">{layer.start.toFixed(0)}</span>
                <span className="font-mono text-xs capitalize select-none truncate text-ellipsis">
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
                display: visible ? "block" : "none",
            }}
            className="cursor-col-resize w-[10px] h-full bg-white/20 hover:bg-white/40 touch-none"
            {...resize()}
        />
    );
};

const SplitCursor = ({
    visible,
    position,
}: {
    visible: boolean;
    position: number;
}) => {
    return (
        visible && (
            <span
                className="group-hover:block hidden absolute inset-0 -translate-x-1/2 bg-[#ff3e5b] w-[2px]"
                style={{
                    left: `${position}px`,
                }}
            />
        )
    );
};

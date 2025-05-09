"use client";

import { useDraggable } from "@dnd-kit/core";
import { Layer } from "./types";
import { useTimeline } from "./TimelineContext";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";

export const LAYER_TYPE_COLORS = {
    audio: "#Ff9ed5",
    video: "#ffd800",
    image: "#C04afe",
    text: "#00954e",
    // green: "#00954e",
    // red: "#Ff3323",
    // white: "#Ffefff",
};

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
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
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
            className="px-2 absolute border-white/20 border top-1/2 -translate-y-1/2 h-full text-primary rounded-[6px] flex items-center cursor-move overflow-hidden"
            style={{
                backgroundColor: LAYER_TYPE_COLORS[layer.type],
                ...style,
                opacity: isLoading ? 0.5 : 1,
                zIndex: isDragging ? 100 : 0,
            }}
        >
            {/* split cursor */}
            <SplitCursor
                visible={isSplitMode && isHovered}
                position={mousePosition.x}
            />

            {/* drag handles */}
            <div className="absolute inset-0 flex justify-between items-center z-50">
                <DragHandle
                    visible={isHovered && !isSplitMode}
                    position="start"
                    onResize={handleResize}
                    label={layer.start.toFixed(0)}
                />
                <DragHandle
                    visible={isHovered && !isSplitMode}
                    position="end"
                    onResize={handleResize}
                    label={layer.end.toFixed(0)}
                />
            </div>

            <div className="relative flex-1 flex justify-between items-center px-2">
                <span className="font-mono text-xs capitalize select-none truncate text-ellipsis">
                    {layer.id}
                </span>
            </div>
        </div>
    );
};

type DragHandlePosition = "start" | "end";

type DragHandleProps = {
    visible: boolean;
    label: string;
    position: DragHandlePosition;
    onResize?: (delta: number, position: DragHandlePosition) => void;
    onResizeEnd?: () => void;
};

const DragHandle = ({
    visible = true,
    label,
    position = "start",
    onResize,
    onResizeEnd,
}: DragHandleProps) => {
    const { scale } = useTimeline();
    const [showLabel, setShowLabel] = useState(false);

    const resize = useDrag(({ event, down, delta: [dx] }) => {
        event.preventDefault();
        event.stopPropagation();

        // show label when dragging
        setShowLabel(down);

        if (down) {
            onResize?.(dx / scale, position);
        } else {
            onResizeEnd?.();
        }
    });

    return (
        <div
            style={{
                display: visible ? "block" : "none",
            }}
            className="cursor-col-resize w-[10px] h-full bg-black/10 hover:bg-black/40 touch-none"
            {...resize()}
        >
            {showLabel && (
                <span className="-translate-y-1/2 text-xs bg-black text-white font-mono">
                    {label}
                </span>
            )}
        </div>
    );
};

const SplitCursor = ({
    visible = false,
    position,
}: {
    visible: boolean;
    position: number;
}) => {
    return (
        visible && (
            <span
                className="absolute inset-0 -translate-x-1/2 bg-[#ff783e] w-[2px] h-full"
                style={{
                    left: `${position}px`,
                }}
            />
        )
    );
};

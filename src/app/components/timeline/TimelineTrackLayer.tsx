"use client";

import { useDraggable } from "@dnd-kit/core";
import { Layer } from "./types";
import { useTimeline } from "./TimelineContext";
import { useDrag } from "@use-gesture/react";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverPortal,
    PopoverTrigger,
} from "@radix-ui/react-popover";
// import { DropdownMenu } from "../DropdownMenu";
// import { cn } from "@/app/utils";
// import { ChevronRight } from "lucide-react";

export const LAYER_TYPE_COLORS = {
    audio: "#EC5E2A",
    video: "#F4B5EE",
    image: "#54AD51",
    text: "#2964F3",
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

    const [menuOpen, setMenuOpen] = useState(false);
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
            className="px-2 absolute h-full text-primary rounded-lg flex items-center cursor-move z-40"
            style={{
                backgroundColor: LAYER_TYPE_COLORS[layer.type],
                ...style,
                opacity: isLoading ? 0.5 : 1,
                zIndex: isDragging ? 100 : 0,
            }}
        >
            {/* split cursor */}
            <SplitCursor
                label={`Split at ${mousePosition.x.toFixed(0)}`}
                visible={isSplitMode && isHovered}
                position={mousePosition.x}
            />

            {/* drag handles */}
            {(isHovered || menuOpen) && !isSplitMode && (
                <>
                    <div className="absolute inset-0 flex justify-between items-center z-50">
                        <>
                            <DragHandle
                                position="start"
                                onResize={handleResize}
                                label={layer.start.toFixed(0)}
                            />
                            <DragHandle
                                position="end"
                                onResize={handleResize}
                                label={layer.end.toFixed(0)}
                            />
                        </>
                    </div>

                    <div className="absolute top-2 right-2 flex justify-end items-center z-50">
                        <TimelineTrackLayerMenu
                            isOpen={menuOpen}
                            setIsOpen={setMenuOpen}
                        />
                    </div>
                </>
            )}

            {/* layer id */}
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
    label: string;
    position: DragHandlePosition;
    onResize?: (delta: number, position: DragHandlePosition) => void;
    onResizeEnd?: () => void;
};

const DragHandle = ({
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
    label,
    position,
}: {
    visible: boolean;
    label: string;
    position: number;
}) => {
    return (
        visible && (
            <div
                className="absolute inset-0 -translate-x-1/2 flex flex-col items-center"
                style={{
                    left: `${position}px`,
                }}
            >
                <span className="bg-black text-white -translate-y-1/2 text-xs p-1 rounded-xs w-fit z-99">
                    {label}
                </span>
                <span className="bg-[#ff783e] w-[2px] h-full" />
            </div>
        )
    );
};

const TimelineTrackLayerMenu = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) => {
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="bg-white rounded-full flex items-center justify-center w-5 h-5 cursor-pointer z-50 select-none text-black"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    <span className="icon">more_vert</span>
                </div>
            </PopoverTrigger>
            <PopoverPortal>
                <PopoverContent
                    className="bg-white rounded-lg shadow-md px-4 py-1 w-[260px] text-black z-50"
                    sideOffset={8}
                >
                    <ul className="flex flex-col">
                        <TimelineTrackLayerMenuItem
                            icon="splitscreen_bottom"
                            label="Move to separate track"
                            onClick={() => {
                                console.log("move to separate track");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="asterisk"
                            label="Save as highlight"
                            onClick={() => {
                                console.log("save as highlight");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="arrow_outward"
                            label="Export"
                            onClick={() => {
                                console.log("export");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="delete"
                            label="Delete"
                            onClick={() => {
                                console.log("delete");
                            }}
                        />
                        {/* <TimelineTrackLayerMenuItem
                            icon="redo"
                            label="Prompt or revise"
                            onClick={() => {
                                console.log("prompt / revise");
                            }}
                        /> */}
                    </ul>
                </PopoverContent>
            </PopoverPortal>
        </Popover>
    );
};

const TimelineTrackLayerMenuItem = ({
    icon,
    label,
    onClick,
}: {
    icon: string;
    label: string;
    onClick: () => void;
}) => {
    return (
        <li
            className="cursor-pointer hover:bg-black/5 hover:pl-3 transition-all duration-75 group [&:not(:last-child)]:border-b border-black/10 py-[7px] hover:rounded-lg ease-in-out hover:border-transparent"
            onClick={onClick}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <span className="group-hover:scale-105 ease-in-out transition-all duration-75 flex items-center gap-2">
                <span className="icon text-xl">{icon}</span>
                <span className="text-sm">{label}</span>
            </span>
        </li>
    );
};

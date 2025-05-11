"use client";

import { useDroppable } from "@dnd-kit/core";
import { useTimeline } from "./TimelineContext";
import { useMemo } from "react";
import { resolveDropPosition } from "./utils";

interface TimelineTrackProps {
    id: string;
    children: React.ReactNode;
}

export const TimelineTrack = ({ id, children }: TimelineTrackProps) => {
    const {
        draggedLayer,
        dragPosition,
        currentTrack,
        layers,
        scale,
        timelineWidth,
    } = useTimeline();

    const { setNodeRef, isOver } = useDroppable({ id });

    const dropPreview = useMemo(() => {
        if (!draggedLayer || !dragPosition || currentTrack?.id !== id)
            return null;

        const { start, end } = resolveDropPosition({
            draggedLayer,
            trackId: id,
            layers,
            rawStart: dragPosition.x / scale,
            timelineWidth,
            scale,
            snapThreshold: 10, // or tune for UX feel
        });

        return { start, end };
    }, [
        id,
        draggedLayer,
        dragPosition,
        currentTrack,
        layers,
        scale,
        timelineWidth,
    ]);

    return (
        <div
            ref={setNodeRef}
            className="relative min-h-30 rounded-md transition-colors"
            style={{ backgroundColor: isOver ? "#1b1b1b" : "transparent" }}
        >
            {dropPreview && (
                <div
                    className="absolute top-0 bottom-0 border border-dashed border-blue-500 rounded-md bg-blue-500/20 z-10 pointer-events-none"
                    style={{
                        left: `${dropPreview.start * scale}px`,
                        width: `${
                            (dropPreview.end - dropPreview.start) * scale
                        }px`,
                    }}
                />
            )}
            {children}
        </div>
    );
};

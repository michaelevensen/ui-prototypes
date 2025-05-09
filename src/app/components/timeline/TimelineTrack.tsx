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
    const { draggedLayer, dragPosition, currentTrack, layers, scale } =
        useTimeline();

    const { setNodeRef, isOver } = useDroppable({ id });

    const dropPreview = useMemo(() => {
        if (!draggedLayer || !dragPosition || currentTrack?.id !== id)
            return null;

        const rawStart = dragPosition.x / scale;

        const { start, end } = resolveDropPosition({
            draggedLayer,
            trackId: id,
            layers,
            rawStart,
            squeezeTolerance: 0.2, // allow up to 20% shrink
        });

        return { start, end };
    }, [draggedLayer, dragPosition, currentTrack, id, layers, scale]);

    return (
        <div
            ref={setNodeRef}
            className="relative min-h-12 rounded transition-colors"
            style={{ backgroundColor: isOver ? "#c2c2c2" : "#e5e5e5" }}
        >
            {dropPreview && (
                <div
                    className="absolute top-0 bottom-0 border border-dashed border-blue-500/50 bg-blue-500/10 z-10 pointer-events-none"
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

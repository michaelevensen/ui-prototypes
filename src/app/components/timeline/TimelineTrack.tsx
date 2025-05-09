"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
import { useTimeline } from "./TimelineContext";
import { useMemo } from "react";

interface TimelineTrackProps {
    id: string;
    children: React.ReactNode;
}

export const TimelineTrack = ({ id, children }: TimelineTrackProps) => {
    const { draggedLayer, dragPosition, currentTrack, layers, scale } =
        useTimeline();

    const { setNodeRef, isOver } = useDroppable({ id });

    useDndMonitor({
        onDragMove: (event) => {
            console.log(event);
        },
    });

    const dropPreview = useMemo(() => {
        if (!draggedLayer || !dragPosition || currentTrack?.id !== id)
            return null;

        const duration = draggedLayer.end - draggedLayer.start;
        let proposedStart = dragPosition.x / scale;
        let proposedEnd = proposedStart + duration;
        let proposedCenter = proposedStart + duration / 2;

        const trackLayers = layers
            .filter((l) => l.trackId === id && l.id !== draggedLayer.id)
            .sort((a, b) => a.start - b.start);

        for (const l of trackLayers) {
            const otherCenter = (l.start + l.end) / 2;

            const overlaps = proposedStart < l.end && proposedEnd > l.start;

            if (overlaps) {
                // If our center is to the left of theirs, clamp to the left
                if (proposedCenter < otherCenter) {
                    proposedStart = l.start - duration;
                }
                // If center is to the right, clamp to the right
                else {
                    proposedStart = l.end;
                }

                // Recompute based on clamped position
                proposedEnd = proposedStart + duration;
                proposedCenter = proposedStart + duration / 2;
            }
        }

        // Clamp to start of timeline
        if (proposedStart < 0) proposedStart = 0;

        return {
            start: proposedStart,
            end: proposedStart + duration,
        };
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

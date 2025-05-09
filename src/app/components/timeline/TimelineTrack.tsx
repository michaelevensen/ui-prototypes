"use client";

import { useDndMonitor, useDroppable } from "@dnd-kit/core";
// import { useTimeline } from "./TimelineContext";
import { useState } from "react";
import { useTimeline } from "./TimelineContext";

export const TimelineTrack = ({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) => {
    const { layers, scale } = useTimeline();
    const { setNodeRef, isOver } = useDroppable({ id });

    // ghost params
    const [offsetX, setOffsetX] = useState(0);
    const [isGhostVisible, setIsGhostVisible] = useState(false);

    // monitor drag events
    useDndMonitor({
        onDragMove(event) {
            const { over, active, delta } = event;
            console.log(over, active, delta);
            // if (!draggedLayer) return;

            // set drag position
            // setDragPosition({
            //     x: draggedLayer.start * scale + delta.x,
            //     y: delta.y,
            // });

            // set ghost params
            const draggedLayer = layers.find((layer) => layer.id === active.id);
            if (!draggedLayer) return;

            setOffsetX(draggedLayer.start * scale + delta.x);

            // set current track
            // if (over) {
            //     const currentTrack = tracks.find(
            //         (track) => track.id === over.id
            //     );
            //     if (currentTrack) {
            //         setCurrentTrack(currentTrack);
            //     }
            // }
        },
        onDragStart() {
            setIsGhostVisible(true);
        },
        onDragEnd() {
            // setDragPosition(null);
            setIsGhostVisible(false);
        },
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: isOver ? "#c2c2c2" : "#f5f5f5",
            }}
            className="relative min-h-12 rounded"
        >
            {isGhostVisible && (
                <div
                    className="absolute h-full w-1 bg-red-500"
                    style={{ left: offsetX }}
                />
            )}
            {children}
        </div>
    );
};

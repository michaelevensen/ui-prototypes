"use client";

import React, { useState } from "react";
import {
    DndContext,
    useDroppable,
    DragEndEvent,
    closestCenter,
    DragMoveEvent,
} from "@dnd-kit/core";
import { Layer, TimelineTrackType, Track } from "./types";
import { TimelineTrackLayer } from "./TimelineTrackLayer";
import { useTimeline } from "./TimelineContext";
import { findClosestEdge } from "./utils";

export const TimelineTracks = () => {
    const { scale, setScale } = useTimeline();
    // const [timelineWidth, setTimelineWidth] = useState(0);
    const [layers, setLayers] = useState<Layer[]>([
        {
            trackId: "track-1",
            id: "layer-1",
            start: 0,
            end: 100,
        },
        {
            trackId: "track-1",
            id: "layer-2",
            start: 100,
            end: 200,
        },
        {
            trackId: "track-2",
            id: "layer-3",
            start: 200,
            end: 300,
        },
        {
            trackId: "track-2",
            id: "layer-4",
            start: 300,
            end: 400,
        },
    ]);
    const [tracks, setTracks] = useState<Track[]>([
        {
            id: "track-1",
            type: TimelineTrackType.Audio,
        },
        {
            id: "track-2",
            type: TimelineTrackType.Video,
        },
        {
            id: "track-3",
            type: TimelineTrackType.Text,
        },
    ]);

    const handleDragMove = (event: DragMoveEvent) => {
        console.log("drag move", event);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        // find active layer
        const activeLayer = layers.find((layer) => layer.id === active.id);

        // move layer to new track if it's not already on the new track
        if (activeLayer?.trackId != over.id) {
            console.log("moving layer to new track");
            setLayers((layers) =>
                layers.map((layer) =>
                    layer.id === active.id
                        ? { ...layer, trackId: over.id.toString() }
                        : layer
                )
            );
        }

        // update layer start and end
        setLayers((layers) =>
            layers.map((layer) =>
                layer.id === active.id
                    ? {
                          ...layer,
                          start: layer.start + event.delta.x / scale,
                          end: layer.end + event.delta.x / scale,
                      }
                    : layer
            )
        );
    };

    const handleResize = (
        layer: Layer,
        newStart: number,
        newEnd: number,
        direction: "left" | "right"
    ) => {
        const closestEdge = findClosestEdge(layer, layers, direction);

        let adjustedStart = newStart;
        let adjustedEnd = newEnd;

        if (direction === "left") {
            // Don't allow resizing past the end of the previous item
            if (closestEdge && newStart < closestEdge.value) {
                adjustedStart = closestEdge.value;
            }
            // Prevent inverting the layer (start can't pass end)
            if (adjustedStart >= layer.end) {
                adjustedStart = layer.end - 1; // enforce minimum width of 1
            }
        }

        if (direction === "right") {
            // Don't allow resizing past the start of the next item
            if (closestEdge && newEnd > closestEdge.value) {
                adjustedEnd = closestEdge.value;
            }
            // Prevent inverting the layer
            if (adjustedEnd <= layer.start) {
                adjustedEnd = layer.start + 1;
            }
        }

        setLayers((layers) =>
            layers.map((l) =>
                l.id === layer.id
                    ? {
                          ...l,
                          start: adjustedStart,
                          end: adjustedEnd,
                      }
                    : l
            )
        );
    };

    const [progress, setProgress] = useState(0);

    const handleMouseDown = (event: React.MouseEvent) => {
        console.log("mouse down", event);
        setProgress(event.clientX / scale);
    };

    const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);

    console.log("hoveredLayer", hoveredLayer);

    return (
        <DndContext
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            collisionDetection={closestCenter}
        >
            <div
                onMouseDown={handleMouseDown}
                className="relative flex flex-col gap-1 p-2"
                style={{
                    width: `${100 * scale}%`,
                }}
            >
                <ProgressBar progress={progress} />

                {tracks.map((track) => (
                    <TimelineTrack key={track.id} id={track.id}>
                        {layers
                            .filter((layer) => layer.trackId === track.id)
                            .map((layer) => (
                                <TimelineTrackLayer
                                    key={layer.id}
                                    layer={layer}
                                    onMouseOver={() => setHoveredLayer(layer)}
                                    onMouseLeave={() => setHoveredLayer(null)}
                                    onResize={(start, end, direction) =>
                                        handleResize(
                                            layer,
                                            start,
                                            end,
                                            direction
                                        )
                                    }
                                />
                            ))}
                    </TimelineTrack>
                ))}
            </div>
            <input
                type="range"
                min={0.1}
                step={0.02}
                max={2}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
            />
            {/* buttons */}
            <div className="flex gap-2 p-4">
                <button
                    aria-label="Split Track"
                    onClick={() => {
                        // go into split mode
                    }}
                >
                    Split Track
                </button>
                <button
                    aria-label="Add Track"
                    onClick={() => {
                        setTracks((tracks) => [
                            ...tracks,
                            {
                                id: `track-${tracks.length + 1}`,
                                type: TimelineTrackType.Audio,
                            },
                        ]);
                    }}
                >
                    Add Track
                </button>
                <button
                    aria-label="Add Layer"
                    onClick={() => {
                        // Find the layer with the highest end time
                        const maxEndTime = Math.max(
                            ...layers
                                .filter((layer) => layer.trackId === "track-1")
                                .map((layer) => layer.end)
                        );

                        setLayers((layers) => [
                            ...layers,
                            {
                                id: `layer-${layers.length + 1}`,
                                trackId: "track-1",
                                start: maxEndTime,
                                end: maxEndTime + 100, // Add 100 units after the last layer
                            },
                        ]);
                    }}
                >
                    Add Layer
                </button>
            </div>
            {/* <DragOverlay>
                <div className="bg-white p-2 rounded-md">
                    <p>Dragging...</p>
                </div>
            </DragOverlay> */}
        </DndContext>
    );
};

const ProgressBar = ({ progress }: { progress: number }) => {
    return (
        <div
            className="h-full absolute z-50 bg-orange-500 w-[2px]"
            style={{ left: `${progress}%` }}
        />
    );
};

const TimelineTrack = ({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: isOver ? "red" : "lightgray",
            }}
            className="relative min-h-12 rounded"
        >
            {children}
        </div>
    );
};

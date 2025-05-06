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
import { TrackLayer } from "./TrackLayer";
import { useTimeline } from "./TimelineContext";

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
        layerId: string,
        newStart: number,
        newEnd: number
    ) => {
        // Find the layer being resized
        // const resizingLayer = layers.find((layer) => layer.id === layerId);
        // if (!resizingLayer) return;

        // Find other layers in the same track
        // const otherLayers = layers.filter(
        //     (layer) =>
        //         layer.trackId === resizingLayer.trackId && layer.id !== layerId
        // );

        // Check for collisions
        // const hasCollision = otherLayers.some((layer) => {
        //     // Check if the new start or end overlaps with any other layer
        //     return (
        //         (newStart >= layer.start && newStart < layer.end) ||
        //         (newEnd > layer.start && newEnd <= layer.end) ||
        //         (newStart <= layer.start && newEnd >= layer.end)
        //     );
        // });

        // // Only update if there's no collision
        // if (!hasCollision) {
        setLayers((layers) =>
            layers.map((layer) =>
                layer.id === layerId
                    ? {
                          ...layer,
                          start: newStart,
                          end: newEnd,
                      }
                    : layer
            )
        );
        // }
    };

    return (
        <DndContext
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            collisionDetection={closestCenter}
        >
            <div
                className="flex flex-col gap-1"
                style={{
                    width: `${100 * scale}%`,
                }}
            >
                {tracks.map((track) => (
                    <TimelineTrack key={track.id} id={track.id}>
                        {layers
                            .filter((layer) => layer.trackId === track.id)
                            .map((layer) => (
                                <TrackLayer
                                    key={layer.id}
                                    layer={layer}
                                    onResize={(start, end) =>
                                        handleResize(layer.id, start, end)
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
            <div className="flex gap-2 p-4">
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
                        setLayers((layers) => [
                            ...layers,
                            {
                                id: `layer-${layers.length + 1}`,
                                trackId: "track-1",
                                start: 400,
                                end: 500,
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
            className="relative h-24 rounded flex items-center gap-2"
        >
            {children}
        </div>
    );
};

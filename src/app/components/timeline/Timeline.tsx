"use client";

import React, { useState } from "react";
// import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
    DndContext,
    useDroppable,
    DragEndEvent,
    closestCenter,
    DragMoveEvent,
    DragStartEvent,
    // DragOverlay,
} from "@dnd-kit/core";
import { Layer, TimelineTrackType, Track } from "./types";
import { TimelineTrackLayer } from "./TimelineTrackLayer";
import { useTimeline } from "./TimelineContext";
import { findOverlappingLayers, collectPushGroup } from "./utils";
import { TimelineControls } from "./TimelineControls";

export const TimelineTracks = () => {
    const {
        scale,
        isSplitMode,
        setActiveLayer,
        hoveredLayer,
        setHoveredLayer,
    } = useTimeline();
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

    const handleDragStart = (event: DragStartEvent) => {
        const layer = layers.find((layer) => layer.id === event.active.id);
        if (layer) {
            setActiveLayer(layer);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        setActiveLayer(null); // Clear active layer when drag ends

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
        setLayers((layers) => {
            const updatedLayers = [...layers];
            const index = updatedLayers.findIndex((l) => l.id === layer.id);
            if (index === -1) return layers;

            const updatedLayer = { ...layer };

            if (direction === "left") {
                updatedLayer.start = newStart;
                if (updatedLayer.start >= updatedLayer.end) {
                    updatedLayer.start = updatedLayer.end - 1;
                }

                const overlapping = findOverlappingLayers(
                    updatedLayers,
                    layer,
                    "left",
                    updatedLayer.start,
                    updatedLayer.end
                );

                if (overlapping.length > 0) {
                    const pushGroup = collectPushGroup(
                        updatedLayers,
                        overlapping[0],
                        "left",
                        1 // maxGap
                    );

                    const overlapAmount =
                        overlapping[0].end - updatedLayer.start;

                    for (const l of pushGroup) {
                        l.start -= overlapAmount;
                        l.end -= overlapAmount;

                        if (l.end <= l.start) {
                            l.end = l.start + 1;
                        }
                    }
                }
            }

            if (direction === "right") {
                updatedLayer.end = newEnd;
                if (updatedLayer.end <= updatedLayer.start) {
                    updatedLayer.end = updatedLayer.start + 1;
                }

                const overlapping = findOverlappingLayers(
                    updatedLayers,
                    layer,
                    "right",
                    updatedLayer.start,
                    updatedLayer.end
                );

                if (overlapping.length > 0) {
                    const pushGroup = collectPushGroup(
                        updatedLayers,
                        overlapping[0],
                        "right",
                        1 // maxGap
                    );

                    const overlapAmount =
                        updatedLayer.end - overlapping[0].start;

                    for (const l of pushGroup) {
                        l.start += overlapAmount;
                        l.end += overlapAmount;
                    }
                }
            }

            updatedLayers[index] = updatedLayer;
            return updatedLayers;
        });
    };
    // const handleResize = (
    //     layer: Layer,
    //     newStart: number,
    //     newEnd: number,
    //     direction: "left" | "right"
    // ) => {
    //     const closestEdge = findClosestEdge(layer, layers, direction);

    //     let adjustedStart = newStart;
    //     let adjustedEnd = newEnd;

    //     switch (direction) {
    //         case "left":
    //             // Don't allow resizing past the end of the previous item
    //             if (closestEdge && newStart < closestEdge.value) {
    //                 adjustedStart = closestEdge.value;
    //             }
    //             // Prevent inverting the layer (start can't pass end)
    //             if (adjustedStart >= layer.end) {
    //                 adjustedStart = layer.end - 1; // enforce minimum width of 1
    //             }
    //             break;
    //         case "right":
    //             // Don't allow resizing past the start of the next item
    //             if (closestEdge && newEnd > closestEdge.value) {
    //                 adjustedEnd = closestEdge.value;
    //             }
    //             // Prevent inverting the layer
    //             if (adjustedEnd <= layer.start) {
    //                 adjustedEnd = layer.start + 1;
    //             }
    //     }

    //     setLayers((layers) =>
    //         layers.map((l) =>
    //             l.id === layer.id
    //                 ? {
    //                       ...l,
    //                       start: adjustedStart,
    //                       end: adjustedEnd,
    //                   }
    //                 : l
    //         )
    //     );
    // };

    const handleSplit = (layer: Layer, splitPosition: number) => {
        if (!isSplitMode) return;

        // splitPosition is already relative to the layer, just need to convert to timeline units
        const splitTime = layer.start + splitPosition / scale;

        // Ensure split time is within layer bounds
        if (splitTime <= layer.start || splitTime >= layer.end) return;

        // Create two new layers
        const firstLayer: Layer = {
            id: `${layer.id}-1`,
            trackId: layer.trackId,
            start: layer.start,
            end: splitTime,
        };

        const secondLayer: Layer = {
            id: `${layer.id}-2`,
            trackId: layer.trackId,
            start: splitTime,
            end: layer.end,
        };

        // Remove the original layer and add the two new ones
        setLayers((layers) =>
            layers
                .filter((l) => l.id !== layer.id)
                .concat([firstLayer, secondLayer])
        );
    };

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            collisionDetection={closestCenter}
        >
            <div
                className="relative flex flex-col gap-1 p-2"
                style={{
                    width: `${100 * scale}%`,
                }}
            >
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
                                    onMouseDown={(x) => {
                                        if (isSplitMode) {
                                            handleSplit(layer, x);
                                        }
                                    }}
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

                <div className="flex flex-col gap-2 font-semibold">
                    {hoveredLayer?.trackId} &mdash; {hoveredLayer?.id}
                </div>
            </div>

            <TimelineControls />

            {/* overlay */}
            {/* <DragOverlay>
                {activeLayer && (
                    <div
                        className="bg-white/50 border-2 border-dashed border-gray-400 rounded h-full"
                        style={{
                            transform: `translate3d(${
                                activeLayer.start * scale
                            }px, 0px, 0)`,
                        }}
                    >
                        {activeLayer?.id}
                    </div>
                )}
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
            className="relative min-h-12 rounded"
        >
            {children}
        </div>
    );
};

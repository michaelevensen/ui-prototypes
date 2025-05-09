"use client";

import React from "react";
// import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
    DndContext,
    DragEndEvent,
    closestCenter,
    DragStartEvent,
    // DragMoveEvent,
    // DragOverlay,
    // useDndMonitor,
} from "@dnd-kit/core";
import { Layer } from "./types";
import { TimelineTrackLayer } from "./TimelineTrackLayer";
import { useTimeline } from "./TimelineContext";
import { findOverlappingLayers, collectPushGroup, splitLayer } from "./utils";
import { TimelineTrack } from "./TimelineTrack";

export const TimelineTracks = () => {
    const {
        scale,
        isSplitMode,
        setDraggedLayer,
        layers,
        setLayers,
        tracks,
        timelineWidth,
    } = useTimeline();

    // const handleDragMove = (event: DragMoveEvent) => {
    //     const { over } = event;
    //     console.log(over);
    //     // if (over) {
    //     //     setCurrentTrack(tracks.find((track) => track.id === over.id));
    //     // }
    // };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const layer = layers.find((layer) => layer.id === active.id);
        if (layer) {
            setDraggedLayer(layer);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        setDraggedLayer(null);

        // find active layer
        const activeLayer = layers.find((layer) => layer.id === active.id);

        // move layer to new track if it's not already on the new track
        if (activeLayer?.trackId != over.id) {
            setLayers((layers: Layer[]) =>
                layers.map((layer: Layer) =>
                    layer.id === active.id
                        ? { ...layer, trackId: over.id.toString() }
                        : layer
                )
            );
        }

        // update layer start and end
        setLayers((layers: Layer[]) =>
            layers.map((layer: Layer) =>
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
        const timelineEnd = timelineWidth ? timelineWidth / scale : Infinity;
        const timelineStart = 0;

        setLayers((layers) => {
            const updatedLayers = [...layers];
            const index = updatedLayers.findIndex((l) => l.id === layer.id);
            if (index === -1) return layers;

            const updatedLayer = { ...layer };

            if (direction === "left") {
                let targetStart = newStart;

                if (targetStart < timelineStart) {
                    targetStart = timelineStart;
                }
                if (targetStart >= layer.end) {
                    targetStart = layer.end - 1;
                }

                updatedLayer.start = targetStart;

                const overlapping = findOverlappingLayers(
                    updatedLayers,
                    layer,
                    "left",
                    targetStart,
                    updatedLayer.end
                );

                if (overlapping.length > 0) {
                    const pushGroup = collectPushGroup(
                        updatedLayers,
                        overlapping[0],
                        "left",
                        1
                    );

                    const overlapAmount = overlapping[0].end - targetStart;
                    const minStart = Math.min(...pushGroup.map((l) => l.start));

                    if (minStart - overlapAmount < timelineStart) {
                        // No room to push — shrink group to fit
                        const totalWidth = pushGroup.reduce(
                            (sum, l) => sum + (l.end - l.start),
                            0
                        );
                        const availableWidth =
                            updatedLayer.start - timelineStart;
                        const scaleFactor = availableWidth / totalWidth;

                        let currentPos = timelineStart;

                        for (const l of pushGroup) {
                            const newWidth = Math.max(
                                (l.end - l.start) * scaleFactor,
                                1
                            );
                            l.start = currentPos;
                            l.end = currentPos + newWidth;
                            currentPos = l.end;
                        }

                        updatedLayer.start = overlapping[0].end;
                    } else {
                        // ✅ Room to push — apply push
                        for (const l of pushGroup) {
                            l.start -= overlapAmount;
                            l.end -= overlapAmount;
                            if (l.end <= l.start) {
                                l.end = l.start + 1;
                            }
                        }
                    }
                }
            }

            if (direction === "right") {
                let targetEnd = newEnd;

                if (targetEnd > timelineEnd) {
                    targetEnd = timelineEnd;
                }
                if (targetEnd <= layer.start) {
                    targetEnd = layer.start + 1;
                }

                updatedLayer.end = targetEnd;

                const overlapping = findOverlappingLayers(
                    updatedLayers,
                    layer,
                    "right",
                    updatedLayer.start,
                    targetEnd
                );

                if (overlapping.length > 0) {
                    const pushGroup = collectPushGroup(
                        updatedLayers,
                        overlapping[0],
                        "right",
                        1
                    );

                    const overlapAmount = targetEnd - overlapping[0].start;
                    const maxEnd = Math.max(...pushGroup.map((l) => l.end));

                    if (maxEnd + overlapAmount > timelineEnd) {
                        // No room to push — shrink group to fit
                        const totalWidth = pushGroup.reduce(
                            (sum, l) => sum + (l.end - l.start),
                            0
                        );
                        const availableWidth = timelineEnd - updatedLayer.end;
                        const scaleFactor = availableWidth / totalWidth;

                        let currentPos = updatedLayer.end;

                        for (const l of pushGroup) {
                            const newWidth = Math.max(
                                (l.end - l.start) * scaleFactor,
                                1
                            );
                            l.start = currentPos;
                            l.end = currentPos + newWidth;
                            currentPos = l.end;
                        }

                        updatedLayer.end = overlapping[0].start;
                    } else {
                        // ✅ Room to push — apply push
                        for (const l of pushGroup) {
                            l.start += overlapAmount;
                            l.end += overlapAmount;
                        }
                    }
                }
            }

            updatedLayers[index] = updatedLayer;
            return updatedLayers;
        });
    };

    const handleSplit = (layer: Layer, splitPosition: number) => {
        if (!isSplitMode) return;

        // splitPosition is already relative to the layer, just need to convert to timeline units
        const splitTime = layer.start + splitPosition / scale;

        // Ensure split time is within layer bounds
        if (splitTime <= layer.start || splitTime >= layer.end) return;

        const [firstLayer, secondLayer] = splitLayer(layer, splitTime);

        // Remove the original layer and add the two new ones
        setLayers((layers: Layer[]) =>
            layers
                .filter((l: Layer) => l.id !== layer.id)
                .concat([firstLayer, secondLayer])
        );
    };

    return (
        <>
            <DndContext
                id="timeline"
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                // onDragMove={handleDragMove}
                collisionDetection={closestCenter}
            >
                <div className="flex flex-col gap-1">
                    {tracks.map((track) => (
                        <TimelineTrack key={track.id} id={track.id}>
                            {layers
                                .filter((layer) => layer.trackId === track.id)
                                .map((layer) => (
                                    <TimelineTrackLayer
                                        key={layer.id}
                                        layer={layer}
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

                    {/* drag overlay */}
                    {/* <DragOverlay
                        dropAnimation={{
                            duration: 500,
                            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
                        }}
                    >
                        {draggedLayer ? (
                            <TimelineTrackLayer
                                key={"dragging"}
                                layer={draggedLayer}
                            />
                        ) : null}
                    </DragOverlay> */}
                </div>
            </DndContext>
        </>
    );
};

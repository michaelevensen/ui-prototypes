"use client";

import React, { useEffect, useState, useRef } from "react";
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
    const timelineRef = useRef<HTMLDivElement | null>(null);
    const [timelineWidth, setTimelineWidth] = useState<number | null>(null);

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

    useEffect(() => {
        if (!timelineRef.current) return;

        const updateWidth = () => {
            setTimelineWidth(timelineRef.current!.offsetWidth);
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(timelineRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragMove={handleDragMove}
            collisionDetection={closestCenter}
        >
            <div
                ref={timelineRef}
                className="relative flex flex-col gap-1 p-2"
                style={{
                    width: `${100 * scale}%`,
                    // width: `${timelineWidth}px`,
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

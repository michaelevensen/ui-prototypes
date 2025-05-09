import { Layer } from "../types";

/**
 * Resolves the drop position for a dragged layer on a timeline track.
 *
 * This function calculates the new start and end positions of a dragged layer
 * based on its current position and the layers on the same track. It ensures
 * that the layer does not overlap with other layers and is within the timeline
 * bounds.
 */
export const resolveDropPosition = ({
    draggedLayer,
    trackId,
    layers,
    rawStart,
    timelineWidth,
    scale,
}: {
    draggedLayer: Layer;
    trackId: string;
    layers: Layer[];
    rawStart: number;
    timelineWidth: number;
    scale: number;
}): { start: number; end: number } => {
    const duration = draggedLayer.end - draggedLayer.start;
    let proposedStart = rawStart;

    const trackLayers = layers
        .filter((l) => l.trackId === trackId && l.id !== draggedLayer.id)
        .sort((a, b) => a.start - b.start);

    const maxTimelineUnits = timelineWidth / scale;
    const MAX_ITER = 10;
    let iter = 0;

    while (iter++ < MAX_ITER) {
        const proposedEnd = proposedStart + duration;
        const proposedCenter = proposedStart + duration / 2;
        let adjusted = false;

        for (const l of trackLayers) {
            const otherCenter = (l.start + l.end) / 2;
            const overlaps = proposedStart < l.end && proposedEnd > l.start;

            if (overlaps) {
                proposedStart =
                    proposedCenter < otherCenter ? l.start - duration : l.end;
                adjusted = true;
                break;
            }
        }

        if (!adjusted) break;
    }

    // Final clamping to timeline bounds
    let clampedStart = Math.max(proposedStart, 0);
    let clampedEnd = clampedStart + duration;

    if (clampedEnd > maxTimelineUnits) {
        clampedEnd = maxTimelineUnits;
        clampedStart = clampedEnd - duration;
        if (clampedStart < 0) {
            clampedStart = 0;
            clampedEnd = duration;
        }
    }

    return {
        start: clampedStart,
        end: clampedEnd,
    };
};

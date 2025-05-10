import { collectPushGroup } from ".";
import { Layer } from "../types";

export const resolveDropPosition = ({
    draggedLayer,
    trackId,
    layers,
    rawStart,
    timelineWidth,
    scale,
    maxGap = 1,
    snapThreshold = 20,
}: {
    draggedLayer: Layer;
    trackId: string;
    layers: Layer[];
    rawStart: number;
    timelineWidth: number;
    scale: number;
    maxGap?: number;
    snapThreshold?: number;
}): { start: number; end: number } => {
    const duration = draggedLayer.end - draggedLayer.start;
    const maxUnits = timelineWidth / scale;

    const trackLayers = layers
        .filter((l) => l.trackId === trackId && l.id !== draggedLayer.id)
        .sort((a, b) => a.start - b.start);

    // 1. Group tight layers using collectPushGroup
    const groups: { start: number; end: number }[] = [];
    const visited = new Set<string>();

    for (const l of trackLayers) {
        if (visited.has(l.id)) continue;
        const group = collectPushGroup(trackLayers, l, "right", maxGap);
        group.forEach((g) => visited.add(g.id));
        groups.push({
            start: group[0].start,
            end: group[group.length - 1].end,
        });
    }

    // 2. Check for overlap with any group
    const proposedStart = rawStart;
    const proposedEnd = rawStart + duration;
    const proposedCenter = proposedStart + duration / 2;

    for (const group of groups) {
        const overlaps = proposedStart < group.end && proposedEnd > group.start;
        if (overlaps) {
            // Clamp outside the group
            const groupCenter = (group.start + group.end) / 2;
            const clampedStart =
                proposedCenter < groupCenter
                    ? group.start - duration
                    : group.end;

            const finalStart = Math.max(
                0,
                Math.min(clampedStart, maxUnits - duration)
            );

            return { start: finalStart, end: finalStart + duration };
        }
    }

    // 3. Snap if near group edges
    for (const group of groups) {
        const snapToStart =
            Math.abs(proposedStart - group.start) <= snapThreshold;
        const snapToEnd = Math.abs(proposedStart - group.end) <= snapThreshold;

        if (snapToStart && group.start + duration <= group.end) {
            return { start: group.start, end: group.start + duration };
        }
        if (snapToEnd && group.end + duration <= maxUnits) {
            return { start: group.end, end: group.end + duration };
        }
    }

    // 4. Free placement if not overlapping or near group
    const fallbackEnd = Math.min(proposedStart + duration, maxUnits);
    const fallbackStart = Math.max(fallbackEnd - duration, 0);

    return { start: fallbackStart, end: fallbackEnd };
};

import { collectPushGroup } from ".";
import type { Layer } from "../types";

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

    // Check for overlap first
    const proposedStart = rawStart;
    const proposedEnd = rawStart + duration;
    const proposedCenter = proposedStart + duration / 2;

    for (const l of trackLayers) {
        const overlaps = proposedStart < l.end && proposedEnd > l.start;
        if (overlaps) {
            // Force clamping away from overlapping item
            const otherCenter = (l.start + l.end) / 2;
            const clampedStart =
                proposedCenter < otherCenter ? l.start - duration : l.end;

            const finalStart = Math.max(
                0,
                Math.min(clampedStart, maxUnits - duration)
            );
            return { start: finalStart, end: finalStart + duration };
        }
    }

    // No overlap, now check for snapping to gaps
    const groups: Layer[][] = [];
    const visited = new Set<string>();

    for (const l of trackLayers) {
        if (visited.has(l.id)) continue;
        const group = collectPushGroup(trackLayers, l, "right", maxGap);
        group.forEach((g) => visited.add(g.id));
        groups.push(group);
    }

    const gaps: { start: number; end: number }[] = [];
    let cursor = 0;

    for (const group of groups) {
        const groupStart = group[0].start;
        const groupEnd = group[group.length - 1].end;

        if (groupStart > cursor) {
            gaps.push({ start: cursor, end: groupStart });
        }

        cursor = Math.max(cursor, groupEnd);
    }

    if (cursor < maxUnits) {
        gaps.push({ start: cursor, end: maxUnits });
    }

    for (const gap of gaps) {
        const gapSize = gap.end - gap.start;
        const distToGapStart = Math.abs(proposedStart - gap.start);

        if (gapSize >= duration && distToGapStart <= snapThreshold) {
            return {
                start: gap.start,
                end: gap.start + duration,
            };
        }
    }

    // No snap, no overlap — free movement
    const fallbackEnd = Math.min(proposedStart + duration, maxUnits);
    const fallbackStart = Math.max(fallbackEnd - duration, 0);

    return { start: fallbackStart, end: fallbackEnd };
};

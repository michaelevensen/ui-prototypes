import { Layer } from "./types";

/**
 * Returns layers on the same track that overlap with the proposed new start/end.
 */
export const findOverlappingLayers = (
    allLayers: Layer[],
    target: Layer,
    direction: "left" | "right",
    newStart: number,
    newEnd: number
): Layer[] => {
    return allLayers
        .filter((other) => {
            if (other.id === target.id || other.trackId !== target.trackId)
                return false;

            if (direction === "left") {
                // Other ends *after* newStart and was previously before current layer
                return other.end > newStart && other.end <= target.start;
            }

            if (direction === "right") {
                // Other starts *before* newEnd and was previously after current layer
                return other.start < newEnd && other.start >= target.end;
            }

            return false;
        })
        .sort((a, b) =>
            direction === "left" ? b.end - a.end : a.start - b.start
        );
};

/**
 * Returns all layers on the same track that are connected to the start layer.
 */
export const collectPushGroup = (
    allLayers: Layer[],
    startLayer: Layer,
    direction: "left" | "right",
    maxGap = 1
): Layer[] => {
    const sameTrack = allLayers
        .filter((l) => l.trackId === startLayer.trackId)
        .sort((a, b) => a.start - b.start);

    const result: Layer[] = [startLayer];
    const visited = new Set<string>([startLayer.id]);

    if (direction === "left") {
        let current = startLayer;
        while (true) {
            const prev = sameTrack
                .filter((l) => !visited.has(l.id) && l.end <= current.start)
                .sort((a, b) => b.end - a.end)[0];

            if (!prev) break;

            const gap = current.start - prev.end;
            if (gap > maxGap) break;

            result.push(prev);
            visited.add(prev.id);
            current = prev;
        }

        return result.sort((a, b) => a.start - b.start);
    }

    if (direction === "right") {
        let current = startLayer;
        while (true) {
            const next = sameTrack
                .filter((l) => !visited.has(l.id) && l.start >= current.end)
                .sort((a, b) => a.start - b.start)[0];

            if (!next) break;

            const gap = next.start - current.end;
            if (gap > maxGap) break;

            result.push(next);
            visited.add(next.id);
            current = next;
        }

        return result.sort((a, b) => a.start - b.start);
    }

    return result;
};

/**
 * Returns all layers on the same track that are connected to the start layer.
 */
// export const collectConnectedLayers = (
//     allLayers: Layer[],
//     startLayer: Layer,
//     direction: "left" | "right"
// ): Layer[] => {
//     const sameTrack = allLayers
//         .filter((l) => l.trackId === startLayer.trackId)
//         .sort((a, b) => a.start - b.start);

//     const visited = new Set<string>();
//     const result: Layer[] = [];

//     const visit = (layer: Layer) => {
//         if (visited.has(layer.id)) return;
//         visited.add(layer.id);
//         result.push(layer);

//         if (direction === "left") {
//             const prev = sameTrack
//                 .filter((l) => l.end === layer.start)
//                 .sort((a, b) => b.start - a.start)[0];
//             if (prev) visit(prev);
//         } else {
//             const next = sameTrack
//                 .filter((l) => l.start === layer.end)
//                 .sort((a, b) => a.start - b.start)[0];
//             if (next) visit(next);
//         }
//     };

//     visit(startLayer);
//     return direction === "left"
//         ? result.sort((a, b) => a.start - b.start)
//         : result.sort((a, b) => a.start - b.start);
// };

export const findClosestEdge = (
    currentItem: Layer,
    allItems: Layer[],
    direction: "left" | "right"
) => {
    const currentStart = currentItem.start;
    const currentEnd = currentItem.end;

    // Only consider layers on the same track
    const sameTrackItems = allItems.filter(
        (item) =>
            item.trackId === currentItem.trackId && item.id !== currentItem.id
    );

    let candidates;

    if (direction === "left") {
        candidates = sameTrackItems
            .filter((item) => item.end <= currentStart)
            .map((item) => ({ id: item.id, value: item.end }));

        return closest(currentStart, candidates);
    }

    if (direction === "right") {
        candidates = sameTrackItems
            .filter((item) => item.start >= currentEnd)
            .map((item) => ({ id: item.id, value: item.start }));

        return closest(currentEnd, candidates);
    }

    return null;
};

const closest = (
    target: number,
    candidates: { id: string; value: number }[]
) => {
    let minDiff = Infinity;
    let closest = null;

    for (const c of candidates) {
        const diff = Math.abs(target - c.value);
        if (diff < minDiff) {
            minDiff = diff;
            closest = c;
        }
    }

    return closest; // { id, value }
};

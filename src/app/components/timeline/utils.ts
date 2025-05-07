import { Layer } from "./types";

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

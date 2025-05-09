import { Layer } from "../types";

export const resolveDropPosition = ({
    draggedLayer,
    trackId,
    layers,
    rawStart,
    squeezeTolerance = 0.2,
}: {
    draggedLayer: Layer;
    trackId: string;
    layers: Layer[];
    rawStart: number;
    squeezeTolerance?: number;
}): { start: number; end: number } => {
    const originalDuration = draggedLayer.end - draggedLayer.start;
    let proposedStart = rawStart;

    const trackLayers = layers
        .filter((l) => l.trackId === trackId && l.id !== draggedLayer.id)
        .sort((a, b) => a.start - b.start);

    const MAX_ITER = 10;
    let iter = 0;

    while (iter++ < MAX_ITER) {
        const proposedEnd = proposedStart + originalDuration;
        const proposedCenter = proposedStart + originalDuration / 2;
        let adjusted = false;

        for (let i = 0; i < trackLayers.length; i++) {
            const l = trackLayers[i];
            const next = trackLayers[i + 1];

            const overlaps = proposedStart < l.end && proposedEnd > l.start;

            if (overlaps) {
                const otherCenter = (l.start + l.end) / 2;
                proposedStart =
                    proposedCenter < otherCenter
                        ? l.start - originalDuration
                        : l.end;
                adjusted = true;
                break;
            }

            // Check for squeeze gap
            if (next) {
                const gapStart = l.end;
                const gapEnd = next.start;
                const gapSize = gapEnd - gapStart;

                if (
                    proposedStart >= gapStart &&
                    proposedStart + originalDuration > gapEnd && // doesn't fit normally
                    originalDuration - gapSize <=
                        originalDuration * squeezeTolerance
                ) {
                    // Squeeze in
                    return {
                        start: gapStart,
                        end: gapEnd,
                    };
                }
            }
        }

        if (!adjusted) break;
    }

    const clampedStart = Math.max(proposedStart, 0);
    return {
        start: clampedStart,
        end: clampedStart + originalDuration,
    };
};

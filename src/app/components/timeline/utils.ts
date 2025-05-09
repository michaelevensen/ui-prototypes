import { Layer, LayerType } from "./types";

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

export const resolveDropPosition = ({
    draggedLayer,
    trackId,
    layers,
    rawStart,
}: {
    draggedLayer: Layer;
    trackId: string;
    layers: Layer[];
    rawStart: number;
}) => {
    const duration = draggedLayer.end - draggedLayer.start;
    const proposedStart = rawStart;
    const proposedEnd = proposedStart + duration;
    const proposedCenter = proposedStart + duration / 2;

    const trackLayers = layers
        .filter((l) => l.trackId === trackId && l.id !== draggedLayer.id)
        .sort((a, b) => a.start - b.start);

    for (const l of trackLayers) {
        const otherCenter = (l.start + l.end) / 2;

        const overlaps = proposedStart < l.end && proposedEnd > l.start;

        if (overlaps) {
            if (proposedCenter < otherCenter) {
                return l.start - duration;
            } else {
                return l.end;
            }
        }
    }

    return Math.max(proposedStart, 0);
};

// export enum VideoToFramesMethod {
//     fps,
//     totalFrames,
// }

// export class VideoToFrames {
//     /**
//      * Extracts frames from the video and returns them as an array of imageData (data URLs)
//      * @param videoUrl URL to the video file (HTML5 compatible format, e.g., MP4)
//      * @param amount Number of frames per second or total number of frames to extract
//      * @param type Extraction method: fps (default) or totalFrames
//      */
//     public static getFrames(
//         videoUrl: string,
//         amount: number,
//         type: VideoToFramesMethod = VideoToFramesMethod.fps
//     ): Promise<string[]> {
//         return new Promise(async (resolve, reject) => {
//             const frames: string[] = [];
//             const canvas: HTMLCanvasElement = document.createElement("canvas");
//             const context = canvas.getContext("2d");

//             if (!context) {
//                 reject("Unable to get canvas 2D context");
//                 return;
//             }

//             const video: HTMLVideoElement = document.createElement("video");
//             video.preload = "auto";
//             video.crossOrigin = "anonymous"; // Useful for CORS-safe videos
//             video.src = videoUrl;

//             video.addEventListener("loadeddata", async () => {
//                 canvas.width = video.videoWidth;
//                 canvas.height = video.videoHeight;
//                 const duration = video.duration;

//                 let totalFrames: number = amount;
//                 if (type === VideoToFramesMethod.fps) {
//                     totalFrames = Math.floor(duration * amount);
//                 }

//                 for (
//                     let time = 0;
//                     time < duration;
//                     time += duration / totalFrames
//                 ) {
//                     const frame = await this.getVideoFrame(
//                         video,
//                         context,
//                         canvas,
//                         time
//                     );
//                     frames.push(frame);
//                 }

//                 resolve(frames);
//             });

//             video.addEventListener("error", () => {
//                 reject("Failed to load the video");
//             });

//             video.load();
//         });
//     }

//     private static getVideoFrame(
//         video: HTMLVideoElement,
//         context: CanvasRenderingContext2D,
//         canvas: HTMLCanvasElement,
//         time: number
//     ): Promise<string> {
//         return new Promise((resolve) => {
//             const onSeeked = () => {
//                 video.removeEventListener("seeked", onSeeked);
//                 this.storeFrame(video, context, canvas, resolve);
//             };

//             video.addEventListener("seeked", onSeeked);
//             video.currentTime = time;
//         });
//     }

//     private static storeFrame(
//         video: HTMLVideoElement,
//         context: CanvasRenderingContext2D,
//         canvas: HTMLCanvasElement,
//         resolve: (frame: string) => void
//     ): void {
//         context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
//         resolve(canvas.toDataURL());
//     }
// }

export const splitLayer = (layer: Layer, splitTime: number): [Layer, Layer] => {
    const createSplitLayer = (
        id: string,
        start: number,
        end: number
    ): Layer => {
        switch (layer.type) {
            case LayerType.Video:
            case LayerType.Image:
            case LayerType.Audio:
                return {
                    id,
                    trackId: layer.trackId,
                    start,
                    end,
                    type: layer.type,
                    url: layer.url,
                };
            case LayerType.Text:
                return {
                    id,
                    trackId: layer.trackId,
                    start,
                    end,
                    type: layer.type,
                    text: layer.text,
                };
        }
    };

    return [
        createSplitLayer(`${layer.id}-a`, layer.start, splitTime),
        createSplitLayer(`${layer.id}-b`, splitTime, layer.end),
    ];
};

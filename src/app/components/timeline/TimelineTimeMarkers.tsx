import React, {
    useMemo,
    useCallback,
    useState,
    RefObject,
    PointerEvent,
} from "react";
import { formatTime } from "./helpers";
import { useTimeline } from "./TimelineContext";

interface Marker {
    time: number;
    position: number;
    isMain: boolean;
}

/**
 * Renders a single marker.
 * Memoized to avoid re-renders unless props actually change.
 */
const MarkerItem = React.memo(({ marker }: { marker: Marker }) => {
    return (
        <div
            className="absolute h-full flex flex-col gap-1 justify-end"
            style={{ left: `${marker.position}px` }}
        >
            {marker.isMain ? (
                <div className="flex flex-col justify-center h-full gap-1">
                    <span className="text-[10px] text-black select-none font-mono">
                        {formatTime(marker.time, "mm:ss")}
                    </span>
                    <div className="w-[1px] h-full bg-primary/50" />
                </div>
            ) : (
                <div className="w-[1px] h-[20%] bg-primary/20 border-dotted" />
            )}
        </div>
    );
});

MarkerItem.displayName = "MarkerItem";

const getDynamicMajorInterval = (timeScale: number): number => {
    // timeScale = “pixels per second.”
    // We'll step through these intervals (in seconds) until we find one that
    // results in at least ~50px between major markers (you can tweak that).
    // E.g. if timeScale=0.5 px/s, then 60s => 60 * 0.5 = 30px (too small),
    // 120s => 120 * 0.5 = 60px (>=50) => use 120s (2 minutes).
    // const intervals = [1, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    const intervals = [15, 30, 60, 120, 300, 600, 900, 1800, 3600];
    // ... 15s, 30s, 1m, 2m, 5m, 10m, 15m, 30m, 60m, etc.

    const minPixelSpacing = 50; // tweak as needed
    for (const interval of intervals) {
        if (interval * timeScale >= minPixelSpacing) {
            return interval;
        }
    }

    return intervals[intervals.length - 1];
};

interface TimelineTimeMarkersProps {
    timelineRef: RefObject<HTMLDivElement | null>;
    onPointerDown?: (time: number) => void;
}

export const TimelineTimeMarkers = ({
    timelineRef,
    onPointerDown,
}: TimelineTimeMarkersProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const { timelineWidth, scale } = useTimeline();
    const timelineVisibleDuration = timelineWidth / scale;

    const markers = useMemo(() => {
        const majorInterval = getDynamicMajorInterval(scale);
        const subdivisions = 5;
        const minorStep = majorInterval / subdivisions;
        const markerArray: Marker[] = [];

        for (let t = 0; t <= timelineVisibleDuration; t += majorInterval) {
            markerArray.push({
                time: t,
                position: t * scale,
                isMain: true,
            });
            for (let i = 1; i < subdivisions; i++) {
                const minor = t + i * minorStep;
                if (minor >= timelineVisibleDuration) break;
                markerArray.push({
                    time: minor,
                    position: minor * scale,
                    isMain: false,
                });
            }
        }
        return markerArray;
    }, [timelineVisibleDuration, scale]);

    // Update the time (scrub position) without re-creating new function references
    const updateTime = useCallback(
        (clientX: number) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const scrollLeft = timelineRef.current.scrollLeft;

            // relativeX accounts for timeline offset + scroll
            const relativeX = Math.max(
                0,
                Math.min(
                    clientX - rect.left + scrollLeft,
                    rect.width + scrollLeft
                )
            );

            // convert back to time
            const newTime = relativeX / scale;
            onPointerDown?.(newTime);
        },
        [timelineRef, onPointerDown, scale]
    );

    // Pointer event handlers
    const handlePointerDown = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            setIsDragging(true);
            updateTime(e.clientX);
            e.currentTarget.setPointerCapture(e.pointerId);
        },
        [updateTime]
    );

    const handlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    }, []);

    const handlePointerMove = useCallback(
        (e: PointerEvent<HTMLDivElement>) => {
            if (isDragging) {
                updateTime(e.clientX);
            }
        },
        [isDragging, updateTime]
    );

    const mainMarkers = markers.filter((marker) => marker.isMain);

    return (
        <>
            <div
                className="sticky bg-muted top-0 h-8 flex-shrink-0 border-b border-foreground/20 hover:cursor-ew-resize z-50"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
            >
                {markers.map((marker, idx) => (
                    <MarkerItem key={idx} marker={marker} />
                ))}
            </div>
            <div className="absolute h-full bg-pink-400">
                {mainMarkers.map((marker, idx) => (
                    <div
                        key={idx}
                        className="absolute h-full w-px bg-foreground/10"
                        style={{ left: `${marker.position}px` }}
                    />
                ))}
                <div
                    className="absolute h-full w-px bg-foreground/20"
                    style={{
                        left: `calc(${
                            timelineVisibleDuration * scale
                        }px - 1px)`,
                    }}
                />
            </div>
        </>
    );
};

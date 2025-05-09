"use client";

import { useTimeline } from "./TimelineContext";
import { TimelineControls } from "./TimelineControls";
import { TimelineTracks } from "./TimelineTracks";
import { useRef } from "react";

export const TimelineLayout = () => {
    const { scale, setMousePosition } = useTimeline();
    const timelineRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     if (!timelineRef.current) return;

    //     const updateWidth = () => {
    //         setTimelineWidth(timelineRef.current!.offsetWidth);
    //     };

    //     updateWidth();

    //     const resizeObserver = new ResizeObserver(updateWidth);
    //     resizeObserver.observe(timelineRef.current);

    //     return () => resizeObserver.disconnect();
    // }, []);

    return (
        <div>
            <div
                ref={timelineRef}
                className="flex flex-col gap-2 relative"
                style={{ width: `${100 * scale}%` }}
                onMouseMove={(e) => {
                    setMousePosition({ x: e.clientX, y: e.clientY });
                }}
            >
                <TimelineTracks />
                <TimelineCurrentMarker />
            </div>

            <TimelineControls />
        </div>
    );
};

const TimelineCurrentMarker = () => {
    const { mousePosition } = useTimeline();

    return (
        <div
            className="absolute h-full w-[1px] bg-slate-300 pointer-events-none"
            style={{ left: `${mousePosition?.x}px` }}
        />
    );
};

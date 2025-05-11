"use client";

import { useEffect, useRef } from "react";
import { useTimeline } from "./TimelineContext";
import { TimelineControls } from "./TimelineControls";
import { TimelineTracks } from "./TimelineTracks";
import { TimelineTimeMarkers } from "./TimelineTimeMarkers";

export const TimelineLayout = () => {
    const { scale, setMousePosition, setTimelineWidth } = useTimeline();
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!timelineRef.current) return;

        const updateWidth = () => {
            setTimelineWidth(timelineRef.current!.offsetWidth);
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(timelineRef.current);

        return () => resizeObserver.disconnect();
    }, [setTimelineWidth]);

    return (
        <div className="flex flex-col gap-2 p-4">
            {/* <div className="overflow-x-scroll scrollbar-hide"> */}
            <div
                ref={timelineRef}
                className="relative"
                style={{ width: `${100 * scale}%` }}
                onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }}
            >
                <TimelineTimeMarkers timelineRef={timelineRef} />
                <CurrentCursor />
                <TimelineTracks />
            </div>
            {/* </div> */}
            <TimelineControls />
        </div>
    );
};

const CurrentCursor = () => {
    const { mousePosition } = useTimeline();

    return (
        <div
            className="absolute h-full w-[1px] bg-slate-300 pointer-events-none z-20"
            style={{ left: `${mousePosition?.x}px` }}
        />
    );
};

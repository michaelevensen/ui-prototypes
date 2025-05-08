"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { Layer } from "./types";

type TimelineContextType = {
    scale: number;
    setScale: (scale: number) => void;
    isSplitMode: boolean;
    setIsSplitMode: (isSplitMode: boolean) => void;
    mousePosition: { x: number; y: number };
    setMousePosition: (mousePosition: { x: number; y: number }) => void;
    activeLayer: Layer | null;
    setActiveLayer: (activeLayer: Layer | null) => void;
    hoveredLayer: Layer | null;
    setHoveredLayer: (hoveredLayer: Layer | null) => void;
    timelinePosition: { left: number; top: number } | null;
    setTimelinePosition: (
        position: { left: number; top: number } | null
    ) => void;
};

const TimelineContext = createContext<TimelineContextType | undefined>(
    undefined
);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
    const [scale, setScale] = useState(1);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [activeLayer, setActiveLayer] = useState<Layer | null>(null);
    const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);
    const [timelinePosition, setTimelinePosition] = useState<{
        left: number;
        top: number;
    } | null>(null);

    return (
        <TimelineContext.Provider
            value={{
                scale,
                setScale,
                isSplitMode,
                setIsSplitMode,
                mousePosition,
                setMousePosition,
                activeLayer,
                setActiveLayer,
                hoveredLayer,
                setHoveredLayer,
                timelinePosition,
                setTimelinePosition,
            }}
        >
            {children}
        </TimelineContext.Provider>
    );
};

export const useTimeline = () => {
    const context = useContext(TimelineContext);
    if (!context) {
        throw new Error("useTimeline must be used within a TimelineProvider");
    }
    return context;
};

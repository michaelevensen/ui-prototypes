"use client";
import { createContext, useContext, ReactNode, useState } from "react";

type TimelineContextType = {
    scale: number;
    setScale: (scale: number) => void;
};

const TimelineContext = createContext<TimelineContextType | undefined>(
    undefined
);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
    const [scale, setScale] = useState(1);

    return (
        <TimelineContext.Provider value={{ scale, setScale }}>
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

"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { Layer, LayerType, TimelineTrackType, Track } from "./types";

type TimelineContextType = {
    scale: number;
    setScale: (scale: number) => void;
    isSplitMode: boolean;
    setIsSplitMode: (isSplitMode: boolean) => void;
    activeLayer: Layer | null;
    setActiveLayer: (activeLayer: Layer | null) => void;
    addTrack: () => void;
    addLayer: (trackId: string) => void;
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    tracks: Track[];
    setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
    // currentTrackId: string | null;
    // setCurrentTrackId: (currentTrackId: string | null) => void;
    hoveredLayer: Layer | null;
    setHoveredLayer: (hoveredLayer: Layer | null) => void;
};

const TimelineContext = createContext<TimelineContextType | undefined>(
    undefined
);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
    const [scale, setScale] = useState(1);
    const [isSplitMode, setIsSplitMode] = useState(false);
    const [activeLayer, setActiveLayer] = useState<Layer | null>(null);
    const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);
    // const [timelinePosition, setTimelinePosition] = useState<{
    //     left: number;
    //     top: number;
    // } | null>(null);

    // const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);

    const [layers, setLayers] = useState<Layer[]>([
        {
            trackId: "track-1",
            id: "layer-1",
            start: 0,
            end: 100,
            type: LayerType.Audio,
        },
        {
            trackId: "track-1",
            id: "layer-2",
            start: 100,
            end: 200,
            type: LayerType.Video,
        },
        {
            trackId: "track-2",
            id: "layer-3",
            start: 200,
            end: 300,
            type: LayerType.Image,
        },
        {
            trackId: "track-2",
            id: "layer-4",
            start: 300,
            end: 400,
            type: LayerType.Text,
        },
    ]);
    const [tracks, setTracks] = useState<Track[]>([
        {
            id: "track-1",
            type: TimelineTrackType.Audio,
        },
        {
            id: "track-2",
            type: TimelineTrackType.Video,
        },
        {
            id: "track-3",
            type: TimelineTrackType.Text,
        },
    ]);

    /**
     * Add a new track to the timeline
     */
    const addTrack = () => {
        setTracks((tracks) => [
            ...tracks,
            { id: `track-${tracks.length + 1}`, type: TimelineTrackType.Audio },
        ]);
    };

    /**
     * Add a layer to a track
     * @param trackId - The id of the track to add the layer to
     */
    const addLayer = (trackId: string) => {
        // Find the layer with the highest end time
        const maxEndTime = Math.max(
            ...layers
                .filter((layer) => layer.trackId === trackId)
                .map((layer) => layer.end)
        );
        setLayers((layers) => [
            ...layers,
            {
                id: `layer-${layers.length + 1}`,
                trackId,
                start: maxEndTime,
                end: maxEndTime + 100, // Add 100 units after the last layer
                type: LayerType.Audio,
            },
        ]);
    };

    return (
        <TimelineContext.Provider
            value={{
                scale,
                setScale,
                isSplitMode,
                setIsSplitMode,
                activeLayer,
                setActiveLayer,
                addTrack,
                addLayer,
                layers,
                setLayers,
                tracks,
                setTracks,
                hoveredLayer,
                setHoveredLayer,
                // currentTrackId,
                // setCurrentTrackId,
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

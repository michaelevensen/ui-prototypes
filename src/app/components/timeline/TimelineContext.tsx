"use client";
import { createContext, useContext, ReactNode, useState } from "react";
import { Layer, LayerType, TimelineTrackType, Track } from "./types";

interface TimelineContextType {
    // data
    layers: Layer[];
    setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
    tracks: Track[];
    addTrack: () => void;
    addLayer: (trackId: string) => void;

    scale: number;
    setScale: (scale: number) => void;
    isSplitMode: boolean;
    setIsSplitMode: (isSplitMode: boolean) => void;

    // the layer that is being dragged
    draggedLayer: Layer | null;
    setDraggedLayer: (layer: Layer | null) => void;

    // when im dragging a layer, i need to know the position of the mouse
    setDragPosition: (position: { x: number; y: number } | null) => void;
    dragPosition: { x: number; y: number } | null;

    // the mouse position over the timeline
    setMousePosition: (position: { x: number; y: number } | null) => void;
    mousePosition: { x: number; y: number } | null;

    // the track that is currently being dragged over
    currentTrack: Track | null;
    setCurrentTrack: (track: Track | null) => void;

    //
    hoveredLayer: Layer | null;
    setHoveredLayer: (layer: Layer | null) => void;

    timelineWidth: number;
    setTimelineWidth: (width: number) => void;
}

export const TimelineContext = createContext<TimelineContextType | null>(null);

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
    const [scale, setScale] = useState(1);
    const [timelineWidth, setTimelineWidth] = useState(0);
    const [isSplitMode, setIsSplitMode] = useState(false);

    // the track that is currently being dragged over
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

    // the layer that is being dragged
    const [draggedLayer, setDraggedLayer] = useState<Layer | null>(null);
    const [dragPosition, setDragPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [mousePosition, setMousePosition] = useState<{
        x: number;
        y: number;
    } | null>(null);

    // the layer that is being hovered over
    const [hoveredLayer, setHoveredLayer] = useState<Layer | null>(null);

    // data
    const [layers, setLayers] = useState<Layer[]>([
        {
            trackId: "track-1",
            id: "layer-1",
            start: 0,
            end: 100,
            type: LayerType.Audio,
            url: "",
        },
        {
            trackId: "track-1",
            id: "layer-2",
            start: 100,
            end: 440,
            type: LayerType.Video,
            url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
        },
        {
            trackId: "track-1",
            id: "layer-5",
            start: 440,
            end: 621,
            type: LayerType.Video,
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        },
        {
            trackId: "track-2",
            id: "layer-3",
            start: 200,
            end: 300,
            type: LayerType.Image,
            url: "https://picsum.photos/200/300",
        },
        {
            trackId: "track-2",
            id: "layer-4",
            start: 300,
            end: 621,
            type: LayerType.Text,
            text: "Hello, world!",
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
                type: LayerType.Text,
                text: "Hello, world!",
            },
        ]);
    };

    return (
        <TimelineContext.Provider
            value={{
                scale,
                isSplitMode,
                draggedLayer,
                hoveredLayer,
                layers,
                tracks,
                dragPosition,
                setDraggedLayer,
                setHoveredLayer,
                currentTrack,
                setCurrentTrack,
                setLayers,
                setScale,
                setIsSplitMode,
                setDragPosition,
                addTrack,
                addLayer,
                timelineWidth,
                setTimelineWidth,
                setMousePosition,
                mousePosition,
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

export enum TimelineTrackType {
    Audio = "audio",
    Video = "video",
    Image = "image",
    Text = "text",
}

export type Track = {
    id: string;
    type: TimelineTrackType;
};

// layer
export enum LayerType {
    Audio = "audio",
    Video = "video",
    Image = "image",
    Text = "text",
}

export type Layer = {
    id: string;
    trackId: string;
    type: LayerType;
    start: number;
    end: number;
} & (
    | { type: LayerType.Video; url: string }
    | { type: LayerType.Image; url: string }
    | { type: LayerType.Audio; url: string }
    | { type: LayerType.Text; text: string }
);

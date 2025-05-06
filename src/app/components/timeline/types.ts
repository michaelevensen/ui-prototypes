export enum TimelineTrackType {
    Audio = "audio",
    Video = "video",
    Image = "image",
    Text = "text",
}

export type Track = {
    id: string;
    type: TimelineTrackType;
    // layers: Layer[];
};

export type Layer = {
    id: string;
    trackId: string;
    start: number;
    end: number;
};

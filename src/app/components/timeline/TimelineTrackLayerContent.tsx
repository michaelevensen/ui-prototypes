import { Layer, LayerType } from "./types";
import { VideoThumbnails } from "../VideoThumbnails";

type VideoLayer = Layer & { type: LayerType.Video };
type ImageLayer = Layer & { type: LayerType.Image };
type TextLayer = Layer & { type: LayerType.Text };

export const TimelineTrackLayerContent = ({ layer }: { layer: Layer }) => {
    switch (layer.type) {
        case LayerType.Video:
            return (
                <TimelineTrackLayerContentVideo layer={layer as VideoLayer} />
            );
        case LayerType.Image:
            return (
                <TimelineTrackLayerContentImage layer={layer as ImageLayer} />
            );
        case LayerType.Text:
            return <TimelineTrackLayerContentText layer={layer as TextLayer} />;
        default:
            return null;
    }
};

const TimelineTrackLayerContentVideo = ({ layer }: { layer: VideoLayer }) => {
    return (
        <VideoThumbnails
            videoUrl={layer.url}
            cacheKey={layer.id}
            extractPercents={[1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99]}
            targetHeight={100}
        />
    );
};

const TimelineTrackLayerContentImage = ({ layer }: { layer: ImageLayer }) => {
    return <img src={layer.url} alt={layer.id} />;
};

const TimelineTrackLayerContentText = ({ layer }: { layer: TextLayer }) => {
    return <div>{layer.text}</div>;
};

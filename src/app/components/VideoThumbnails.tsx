// import { useMemo } from "react";
import { useVideoThumbnails } from "./timeline/hooks/useVideoThumbnails";

interface VideoThumbnailsProps {
    videoUrl: string;
    cacheKey?: string;
    extractPercents?: number[];
    targetHeight?: number;
}

export const VideoThumbnails = ({
    videoUrl,
    cacheKey,
    extractPercents,
    targetHeight,
}: VideoThumbnailsProps) => {
    // const extractPercents = useMemo(
    //     () => [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 99],
    //     []
    // );
    const { thumbnails, loading, error } = useVideoThumbnails({
        cacheKey: cacheKey,
        jpegQuality: 0.6,
        videoUrl: videoUrl,
        extractFramesAtPercents: extractPercents,
        targetHeight: targetHeight,
    });

    return (
        <div className="flex gap-[1px] w-full h-full min-w-0">
            {loading && <div className="w-10 h-10 bg-white/10" />}
            {error && <div className="w-10 h-10 bg-red-500">Error</div>}
            {!loading &&
                !error &&
                thumbnails.map((thumbnail, index) => (
                    <img
                        key={index}
                        src={thumbnail}
                        alt={`Thumbnail ${index}`}
                        className="h-full flex-1 object-cover min-w-0"
                    />
                ))}
        </div>
    );
};

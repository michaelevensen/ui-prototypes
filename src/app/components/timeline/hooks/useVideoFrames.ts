import { useState, useCallback } from "react";
import { VideoToFrames, VideoToFramesMethod } from "../utils";

interface UseVideoFramesOptions {
    amount: number;
    method?: VideoToFramesMethod;
}

export function useVideoFrames() {
    const [frames, setFrames] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const extractFrames = useCallback(
        async (videoUrl: string, options: UseVideoFramesOptions) => {
            setLoading(true);
            setError(null);
            setFrames([]);

            try {
                const extractedFrames = await VideoToFrames.getFrames(
                    videoUrl,
                    options.amount,
                    options.method ?? VideoToFramesMethod.fps
                );
                setFrames(extractedFrames);
            } catch (err) {
                setError(
                    typeof err === "string" ? err : "Unknown error occurred"
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        frames,
        loading,
        error,
        extractFrames,
    };
}

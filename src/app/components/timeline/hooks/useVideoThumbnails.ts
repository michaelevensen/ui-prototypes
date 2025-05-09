"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface UseVideoThumbnailsOptions {
    videoUrl: string;
    cacheKey?: string; // ← optional stable identifier
    extractFramesAt?: number[];
    extractFrameEvery?: number;
    extractFramesAtPercents?: number[];
    targetHeight?: number;
    jpegQuality?: number;
}

export const useVideoThumbnails = ({
    videoUrl,
    cacheKey,
    extractFramesAt,
    extractFrameEvery,
    jpegQuality = 0.8,
    extractFramesAtPercents,
    targetHeight = 100,
}: UseVideoThumbnailsOptions) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const extractionConfig = useMemo(
        () => ({
            extractFramesAt,
            extractFrameEvery,
            extractFramesAtPercents,
        }),
        [extractFramesAt, extractFrameEvery, extractFramesAtPercents]
    );

    useEffect(() => {
        if (cacheKey) {
            const cached = localStorage.getItem(`video-thumbnails-${cacheKey}`);
            if (cached) {
                setThumbnails(JSON.parse(cached));
                setLoading(false);
                return;
            }
        }

        const optionsCount =
            Object.values(extractionConfig).filter(Boolean).length;

        if (optionsCount === 0) {
            console.warn(
                "Provide one of extractFramesAt, extractFrameEvery, or extractFramesAtPercents"
            );
            return;
        }
        if (optionsCount > 1) {
            console.warn(
                "Only one of extractFramesAt, extractFrameEvery, or extractFramesAtPercents should be provided"
            );
            return;
        }

        const video = document.createElement("video");
        // NOTE: This needs to be set before src
        video.preload = "auto";
        video.crossOrigin = "anonymous"; // Useful for CORS-safe videos
        video.src = videoUrl;
        // video.muted = true; // Prevent autoplay restrictions
        // video.playsInline = true;
        videoRef.current = video;
        // video.src = `/api/proxy?url=${encodeURIComponent(videoUrl)}`;

        video.addEventListener("loadedmetadata", async () => {
            try {
                const canvas = document.createElement("canvas");
                canvasRef.current = canvas;

                const scale = targetHeight / video.videoHeight;
                canvas.width = Math.round(video.videoWidth * scale);
                canvas.height = targetHeight;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                let times: number[] = [];

                if (extractionConfig.extractFramesAt) {
                    times = extractionConfig.extractFramesAt;
                } else if (extractionConfig.extractFrameEvery) {
                    const duration = video.duration;
                    for (
                        let t = 0;
                        t <= duration;
                        t += extractionConfig.extractFrameEvery
                    ) {
                        times.push(t);
                    }
                } else if (extractionConfig.extractFramesAtPercents) {
                    const duration = video.duration;
                    times = extractionConfig.extractFramesAtPercents.map(
                        (p) => (Math.min(Math.max(p, 0), 100) / 100) * duration
                    );
                }

                const captures: string[] = [];

                for (const time of times) {
                    await new Promise<void>((resolve) => {
                        const handleSeeked = () => {
                            console.log("handleSeeked", time);
                            ctx.drawImage(
                                video,
                                0,
                                0,
                                canvas.width,
                                canvas.height
                            );
                            const dataUrl = canvas.toDataURL(
                                "image/jpeg",
                                jpegQuality
                            );
                            captures.push(dataUrl);
                            video.removeEventListener("seeked", handleSeeked);
                            resolve();
                        };

                        video.addEventListener("seeked", handleSeeked);
                        video.currentTime = time;
                    });
                }

                // setThumbnails(captures);
                if (cacheKey) {
                    localStorage.setItem(
                        `video-thumbnails-${cacheKey}`,
                        JSON.stringify(captures)
                    );
                }
                setThumbnails(captures);
            } catch (err) {
                console.error("Thumbnail extraction failed:", err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
            return () => {
                // Cleanup function
                if (videoRef.current) {
                    videoRef.current.src = "";
                    videoRef.current = null;
                }
                if (canvasRef.current) {
                    canvasRef.current = null;
                }
            };
        });
    }, [videoUrl, targetHeight, cacheKey, extractionConfig]);

    return { thumbnails, loading, error };
};

export const formatTime = (
    time: number,
    format: "m:ss" | "ss" | "mm:ss" | "ss:ms" | "mm:ss:ff" = "m:ss"
): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);

    if (format === "ss:ms") {
        return `${seconds.toString().padStart(2, "0")}:${milliseconds
            .toString()
            .padStart(3, "0")}`;
    }

    if (format === "mm:ss:ff") {
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
    }

    if (format === "ss") {
        return seconds.toString().padStart(2, "0");
    }

    if (format === "mm:ss") {
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

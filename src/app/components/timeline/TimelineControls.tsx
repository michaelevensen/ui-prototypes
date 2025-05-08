import { useTimeline } from "./TimelineContext";

export const TimelineControls = () => {
    const { isSplitMode, setIsSplitMode, scale, setScale } = useTimeline();
    return (
        <div className="flex gap-2 p-4">
            <input
                type="range"
                min={0.1}
                step={0.02}
                max={2}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
            />
            <button
                aria-label="Split Track"
                className="text-white px-2 py-1"
                style={{
                    backgroundColor: isSplitMode ? "#ff3e5b" : "#292929",
                }}
                onClick={() => {
                    setIsSplitMode(!isSplitMode);
                }}
            >
                {isSplitMode ? "Disable Split Mode" : "Enable Split Mode"}
            </button>
            <button
                aria-label="Add Track"
                className="bg-[#292929] text-white px-2 py-1"
                onClick={() => {
                    // setTracks((tracks) => [
                    //     ...tracks,
                    //     {
                    //         id: `track-${tracks.length + 1}`,
                    //         type: TimelineTrackType.Audio,
                    //     },
                    // ]);
                }}
            >
                Add Track
            </button>
            <button
                aria-label="Add Layer"
                className="bg-[#292929] text-white px-2 py-1"
                onClick={() => {
                    // Find the layer with the highest end time
                    // const maxEndTime = Math.max(
                    //     ...layers
                    //         .filter((layer) => layer.trackId === "track-1")
                    //         .map((layer) => layer.end)
                    // );
                    // setLayers((layers) => [
                    //     ...layers,
                    //     {
                    //         id: `layer-${layers.length + 1}`,
                    //         trackId: "track-1",
                    //         start: maxEndTime,
                    //         end: maxEndTime + 100, // Add 100 units after the last layer
                    //     },
                    // ]);
                }}
            >
                Add Layer
            </button>
        </div>
    );
};

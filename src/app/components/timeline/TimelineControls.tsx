import { useTimeline } from "./TimelineContext";

export const TimelineControls = () => {
    const { isSplitMode, setIsSplitMode, scale, setScale, addTrack, addLayer } =
        useTimeline();

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
                style={{
                    backgroundColor: isSplitMode ? "#ff783e" : "#292929",
                    color: isSplitMode ? "black" : "white",
                }}
                onClick={() => {
                    setIsSplitMode(!isSplitMode);
                }}
            >
                <span className="icon">split_scene</span>
                {isSplitMode ? "Disable Split Mode" : "Enable Split Mode"}
            </button>
            <button
                aria-label="Add Track"
                className="bg-[#292929] text-white px-2 py-1"
                onClick={addTrack}
            >
                <span className="icon">add</span>
                Add Track
            </button>
            <button
                aria-label="Add Layer"
                className="bg-[#292929] text-white px-2 py-1"
                onClick={() => {
                    addLayer("track-1");
                }}
            >
                <span className="icon">add</span>
                Add Layer
            </button>
        </div>
    );
};

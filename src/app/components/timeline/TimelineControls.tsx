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
                className={isSplitMode ? "active" : ""}
                onClick={() => {
                    setIsSplitMode(!isSplitMode);
                }}
            >
                <span className="icon">split_scene</span>
                Split
            </button>
            <button aria-label="Add Track" onClick={addTrack}>
                <span className="icon">add_row_below</span>
                Add Track
            </button>
            <button
                aria-label="Add Layer"
                onClick={() => {
                    addLayer("track-1");
                }}
            >
                <span className="icon">web_stories</span>
                Add Layer
            </button>
        </div>
    );
};

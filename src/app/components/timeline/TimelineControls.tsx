import { useTimeline } from "./TimelineContext";

export const TimelineControls = () => {
    const { isSplitMode, setIsSplitMode, scale, setScale, addTrack, addLayer } =
        useTimeline();

    return (
        <div className="flex gap-2 p-4">
            <div className="flex gap-2">
                <button
                    aria-label="Split Layer"
                    className={` ${isSplitMode ? "button active" : "button"}`}
                    onClick={() => {
                        setIsSplitMode(!isSplitMode);
                    }}
                >
                    <span className="icon">split_scene</span>
                    Split Layer
                </button>
                <button
                    aria-label="Add Track"
                    className="button"
                    onClick={addTrack}
                >
                    <span className="icon">add_row_below</span>
                    Add Track
                </button>
                <button
                    aria-label="Add Layer"
                    className="button"
                    onClick={() => {
                        addLayer("track-1");
                    }}
                >
                    <span className="icon">web_stories</span>
                    Add Layer
                </button>
            </div>
            <input
                type="range"
                min={0.5}
                step={0.001}
                max={2}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
            />
            <span className="text-xs text-slate-500">{scale.toFixed(2)}x</span>
        </div>
    );
};

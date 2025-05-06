import { TimelineTracks } from "./components/timeline/Timeline";
import { TimelineProvider } from "./components/timeline/TimelineContext";

export default function Home() {
    return (
        <TimelineProvider>
            <TimelineTracks />
        </TimelineProvider>
    );
}

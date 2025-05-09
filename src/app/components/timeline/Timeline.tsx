import { TimelineProvider } from "./TimelineContext";
import { TimelineLayout } from "./TimelineLayout";

export const Timeline = () => {
    return (
        <TimelineProvider>
            <TimelineLayout />
        </TimelineProvider>
    );
};

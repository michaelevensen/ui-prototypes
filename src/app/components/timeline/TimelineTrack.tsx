import { useDroppable } from "@dnd-kit/core";

export const TimelineTrack = ({
    id,
    children,
}: {
    id: string;
    children: React.ReactNode;
}) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                backgroundColor: isOver ? "#c2c2c2" : "#f5f5f5",
            }}
            className="relative min-h-12 rounded"
        >
            {children}
        </div>
    );
};

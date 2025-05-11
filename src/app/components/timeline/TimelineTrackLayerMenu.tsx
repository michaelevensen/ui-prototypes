import {
    Popover,
    PopoverContent,
    PopoverPortal,
    PopoverTrigger,
} from "@radix-ui/react-popover";
import { cn } from "@/app/utils";

export const TimelineTrackLayerMenu = ({
    isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}) => {
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div
                    className="bg-white rounded-full flex items-center justify-center w-5 h-5 cursor-pointer z-50 select-none text-black"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    <span className="icon">more_vert</span>
                </div>
            </PopoverTrigger>
            <PopoverPortal>
                <PopoverContent
                    className="bg-white rounded-lg shadow-md px-4 py-1 w-[260px] text-black z-50"
                    sideOffset={8}
                >
                    <ul className="flex flex-col">
                        <TimelineTrackLayerMenuItem
                            icon="splitscreen_bottom"
                            label="Move to separate track"
                            onClick={() => {
                                console.log("move to separate track");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="asterisk"
                            label="Save as highlight"
                            onClick={() => {
                                console.log("save as highlight");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="arrow_outward"
                            label="Export"
                            onClick={() => {
                                console.log("export");
                            }}
                        />
                        <TimelineTrackLayerMenuItem
                            icon="delete"
                            label="Delete"
                            onClick={() => {
                                console.log("delete");
                            }}
                        />
                        {/* <TimelineTrackLayerMenuItem
                            icon="redo"
                            label="Prompt or revise"
                            onClick={() => {
                                console.log("prompt / revise");
                            }}
                        /> */}
                    </ul>
                </PopoverContent>
            </PopoverPortal>
        </Popover>
    );
};

const TimelineTrackLayerMenuItem = ({
    icon,
    label,
    onClick,
}: {
    icon: string;
    label: string;
    onClick: () => void;
}) => {
    // "transition-all duration-snappy ease-snappy",

    return (
        <li
            className={cn(
                "hover:pl-3 hover:scale-105",
                "group",
                "flex items-center gap-2",
                "hover:bg-black/5 hover:border-transparent",
                "transition-all duration-snappy ease-snappy",
                "cursor-pointer  [&:not(:last-child)]:border-b border-black/10 py-[8px] hover:rounded-lg select-none"
            )}
            onClick={onClick}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <span className="icon text-xl">{icon}</span>
            <span className="text-sm">{label}</span>
        </li>
    );
};

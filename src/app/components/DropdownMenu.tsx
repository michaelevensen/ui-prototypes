"use client";

import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils";

interface DropdownMenuProps {
    items: {
        icon: React.ReactNode;
        label: string;
    }[];
    dark?: boolean;
    className?: string;
}

export const DropdownMenu = ({ items, dark, className }: DropdownMenuProps) => {
    // const { scrollYProgress } = useScroll({
    //     offset: ["start end", "end start"],
    // });

    // // const randomizedOffset = 250 + Math.floor(Math.random() * (350 - 250 + 1));
    // const y = useTransform(scrollYProgress, [0, 1], [0, -280]);

    return (
        <motion.div
            className={cn(
                "rounded-[24px] border border-black/10 text-primary bg-white shadow-[18px_24px_34px_6px_rgba(0,0,0,0.06)]",
                dark && "dark",
                "px-6 py-2 md:px-8 md:py-5 w-full md:w-[492px]",
                className
            )}
            // style={{ y }}
        >
            {items.map((item) => (
                <DropdownMenuItem dark={dark} key={item.label} {...item} />
            ))}
        </motion.div>
    );
};

const DropdownMenuItem = ({
    label,
    icon,
    dark,
}: {
    label: string;
    icon: React.ReactNode;
    dark?: boolean;
}) => {
    return (
        <div
            className={cn(
                "relative",
                // "transition-all duration-300",
                "hover:scale-105 hover:pl-6",
                // "hover:my-1",
                "transition-all duration-snappy ease-snappy",
                "flex items-center gap-[17px]",
                "pointer-events-auto",
                "py-[13px]",
                "select-none cursor-pointer group hover:pl-5 hover:border-transparent",
                dark
                    ? "text-white hover:bg-black/10"
                    : "text-black hover:bg-white/10",
                "[&:not(:last-child)]:border-b",
                // dark ? "border-white/10" : "border-black/5",
                "md:gap-[18px] md:hover:pl-5 md:hover:border-transparent"
            )}
        >
            <span className="icon flex items-center justify-center w-[36px] aspect-square">
                {icon}
            </span>
            <span>{label}</span>
            <div className="group-hover:bg-slate-400/10 opacity-0 group-hover:opacity-100 w-full h-full flex items-center justify-end rounded-2xl inset-0 absolute px-5">
                <ChevronRight
                    size={22}
                    className="opacity-20 transition-all duration-300"
                />
            </div>
        </div>
    );
};

"use client";

export default function GradientText() {
    return (
        <>
            <style jsx>{`
                @keyframes gradient {
                    0% {
                        background-position: 200% 50%;
                    }
                    100% {
                        background-position: -200% 50%;
                    }
                }
            `}</style>
            <div
                className="flex items-center gap-4 justify-center w-fit h-fit bg-[linear-gradient(45deg,rgba(75,85,99,1)0%,rgba(75,85,99,1)40%,rgba(255,255,255,1)50%,rgba(75,85,99,1)60%,rgba(75,85,99,1)100%)] bg-[length:400%_100%] text-transparent bg-clip-text"
                style={{
                    animation: "gradient 8s linear infinite",
                }}
            >
                <div className="transition-all duration-75 ease-in-out cursor-pointer px-4 py-3 border-transparent border hover:border-black/5 rounded-sm">
                    <span className="text-sm font-mono">
                        Figuring things out
                    </span>
                </div>
                <div className="transition-all duration-75 ease-in-out cursor-pointer px-4 py-3 border-transparent border hover:border-black/5 rounded-sm">
                    <span className="text-sm font-mono">Doing subtasks</span>
                </div>
            </div>
        </>
    );
}

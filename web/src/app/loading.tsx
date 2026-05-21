export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-6">

                {/* Mechanical SVG */}
                <svg
                    width="200"
                    height="160"
                    viewBox="0 0 200 160"
                    aria-hidden="true"
                    className="overflow-visible"
                >
                    {/* Large gear — clockwise */}
                    <g style={{ transformOrigin: "60px 80px" }} className="animate-[gear-cw_2.4s_linear_infinite]">
                        <circle cx="60" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground" />
                        <circle cx="60" cy="80" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
                        <g stroke="currentColor" strokeWidth="5" strokeLinecap="round" className="text-muted-foreground">
                            <line x1="60" y1="44" x2="60" y2="50" />
                            <line x1="60" y1="110" x2="60" y2="116" />
                            <line x1="24" y1="80" x2="30" y2="80" />
                            <line x1="90" y1="80" x2="96" y2="80" />
                            <line x1="34.5" y1="54.5" x2="38.7" y2="58.7" />
                            <line x1="81.3" y1="101.3" x2="85.5" y2="105.5" />
                            <line x1="85.5" y1="54.5" x2="81.3" y2="58.7" />
                            <line x1="38.7" y1="101.3" x2="34.5" y2="105.5" />
                        </g>
                    </g>

                    {/* Small gear — counter-clockwise */}
                    <g style={{ transformOrigin: "117px 80px" }} className="animate-[gear-ccw_1.6s_linear_infinite]">
                        <circle cx="117" cy="80" r="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground" />
                        <circle cx="117" cy="80" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                        <g stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-muted-foreground">
                            <line x1="117" y1="54" x2="117" y2="59" />
                            <line x1="117" y1="101" x2="117" y2="106" />
                            <line x1="91" y1="80" x2="96" y2="80" />
                            <line x1="138" y1="80" x2="143" y2="80" />
                            <line x1="98.6" y1="61.6" x2="102.1" y2="65.1" />
                            <line x1="131.9" y1="94.9" x2="135.4" y2="98.4" />
                            <line x1="135.4" y1="61.6" x2="131.9" y2="65.1" />
                            <line x1="102.1" y1="94.9" x2="98.6" y2="98.4" />
                        </g>
                    </g>

                    {/* Piston */}
                    <g style={{ transformOrigin: "155px 78px" }} className="animate-[piston_1.2s_ease-in-out_infinite]">
                        <rect x="143" y="60" width="24" height="36" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                        <line x1="155" y1="60" x2="155" y2="20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" className="text-muted-foreground/50" />
                        <rect x="149" y="16" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
                        <line x1="148" y1="72" x2="143" y2="72" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
                        <line x1="148" y1="80" x2="143" y2="80" stroke="currentColor" strokeWidth="1" className="text-muted-foreground/40" />
                    </g>
                </svg>

                {/* Tick dots + label */}
                <div className="flex items-center gap-2.5">
                    {[0, 0.2, 0.4].map((delay) => (
                        <div
                            key={delay}
                            style={{ animationDelay: `${delay}s` }}
                            className="w-1.5 h-1.5 rounded-[2px] bg-muted-foreground animate-[tick-fade_1.2s_ease-in-out_infinite]"
                        />
                    ))}
                    <p className="mx-1 text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
                        Processing
                    </p>
                    {[0.6, 0.8, 1.0].map((delay) => (
                        <div
                            key={delay}
                            style={{ animationDelay: `${delay}s` }}
                            className="w-1.5 h-1.5 rounded-[2px] bg-muted-foreground animate-[tick-fade_1.2s_ease-in-out_infinite]"
                        />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes gear-cw  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
                @keyframes gear-ccw { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
                @keyframes piston   {
                    0%, 100% { transform: translateY(0px);  }
                    50%      { transform: translateY(10px); }
                }
                @keyframes tick-fade {
                    0%, 100% { opacity: 0.35; }
                    50%      { opacity: 1;    }
                }
            `}</style>
        </div>
    );
}
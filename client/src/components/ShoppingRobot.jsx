import React from "react";
import { useNavigate } from "react-router-dom";

const ShoppingRobot = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes robotFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes robotGlow {
          0%, 100% {
            box-shadow:
              0 0 12px rgba(34, 211, 238, 0.45),
              0 0 30px rgba(168, 85, 247, 0.15);
          }
          50% {
            box-shadow:
              0 0 22px rgba(34, 211, 238, 0.75),
              0 0 45px rgba(168, 85, 247, 0.3);
          }
        }

        @keyframes robotEye {
          0%, 90%, 100% {
            opacity: 1;
          }
          95% {
            opacity: 0.15;
          }
        }

        .shopping-robot-float {
          animation: robotFloat 3s ease-in-out infinite;
        }

        .shopping-robot-glow {
          animation: robotGlow 2.5s ease-in-out infinite;
        }

        .shopping-robot-eye {
          animation: robotEye 3s infinite;
        }
      `}</style>

      <button
        type="button"
        onClick={() => navigate("/ai-shopping")}
        aria-label="Open AI Shopping Assistant"
        className="
          fixed
          right-4
          md:right-6
          bottom-20
          md:bottom-6
          z-[999]
          group
          shopping-robot-float
          focus:outline-none
        "
      >
        {/* Tooltip */}
        <div
          className="
            absolute
            right-full
            mr-3
            top-1/2
            -translate-y-1/2
            whitespace-nowrap
            rounded-xl
            border border-cyan-400/30
            bg-slate-950/95
            px-3
            py-2
            text-xs
            font-bold
            text-cyan-300
            opacity-0
            pointer-events-none
            translate-x-2
            group-hover:opacity-100
            group-hover:translate-x-0
            transition-all
            duration-300
            shadow-[0_0_20px_rgba(34,211,238,0.2)]
          "
        >
          🤖 AI Shopping Assistant
        </div>

        {/* Robot */}
        <div
          className="
            shopping-robot-glow
            relative
            w-16
            h-16
            md:w-[72px]
            md:h-[72px]
            rounded-2xl
            border
            border-cyan-400/50
            bg-gradient-to-br
            from-slate-800
            via-slate-900
            to-purple-950
            flex
            items-center
            justify-center
            overflow-visible
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:border-cyan-300
          "
        >
          {/* Antenna */}
          <div
            className="
              absolute
              -top-4
              left-1/2
              -translate-x-1/2
              flex
              flex-col
              items-center
            "
          >
            <div className="w-[2px] h-3 bg-cyan-400" />

            <div
              className="
                w-2
                h-2
                rounded-full
                bg-cyan-300
                shadow-[0_0_10px_rgba(34,211,238,0.9)]
                animate-pulse
              "
            />
          </div>

          {/* Robot Head */}
          <div
            className="
              relative
              w-11
              h-9
              md:w-12
              md:h-10
              rounded-xl
              bg-gradient-to-br
              from-slate-200
              via-slate-300
              to-slate-500
              border-2
              border-cyan-300/60
              shadow-inner
            "
          >
            {/* Face */}
            <div
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                w-8
                h-5
                rounded-md
                bg-slate-950
                border
                border-cyan-400/30
                flex
                items-center
                justify-center
                gap-2
              "
            >
              <span
                className="
                  shopping-robot-eye
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_7px_rgba(34,211,238,1)]
                "
              />

              <span
                className="
                  shopping-robot-eye
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-cyan-300
                  shadow-[0_0_7px_rgba(34,211,238,1)]
                "
              />
            </div>
          </div>

          {/* Robot Body */}
          <div
            className="
              absolute
              bottom-1
              left-1/2
              -translate-x-1/2
              w-7
              h-3
              rounded-md
              bg-gradient-to-r
              from-purple-500
              to-cyan-400
              opacity-90
            "
          />

          {/* Side lights */}
          <div className="absolute left-1 top-1/2 w-1.5 h-1.5 rounded-full bg-pink-400 shadow-[0_0_7px_rgba(244,63,94,0.9)]" />

          <div className="absolute right-1 top-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_7px_rgba(34,211,238,0.9)]" />

          {/* Notification dot */}
          <div
            className="
              absolute
              -right-1
              -top-1
              w-4
              h-4
              rounded-full
              bg-gradient-to-r
              from-pink-500
              to-purple-500
              border-2
              border-slate-950
              animate-pulse
            "
          />
        </div>
      </button>
    </>
  );
};

export default ShoppingRobot;
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const assets = [
  {
    label: "Ruby Block",
    headline: "JOY SEET",
    color: "bg-pink-500",
    shape: "rounded-[28%]",
    size: "h-44 w-44 md:h-56 md:w-56",
  },
  {
    label: "Blue Jewel",
    headline: "JOY SEET",
    color: "bg-cyan-400",
    shape: "rounded-[34%]",
    size: "h-52 w-44 md:h-64 md:w-52",
  },
  {
    label: "Red Cluster",
    headline: "JOY SEET",
    color: "bg-red-600",
    shape: "rounded-full",
    size: "h-44 w-56 md:h-52 md:w-72",
    cluster: true,
  },
  {
    label: "Glass Column",
    headline: "JOY SEET",
    color: "bg-white/30",
    shape: "rounded-[22%]",
    size: "h-60 w-36 md:h-72 md:w-44",
    glass: true,
  },
  {
    label: "Pink Gem",
    headline: "JOY SEET",
    color: "bg-fuchsia-500",
    shape: "rounded-[26%]",
    size: "h-40 w-40 md:h-52 md:w-52",
  },
];

export function wrapIndex(index: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  return ((index % itemCount) + itemCount) % itemCount;
}

export function getNextIndex(currentIndex: number, wheelDeltaY: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  if (wheelDeltaY > 0) return wrapIndex(currentIndex + 1, itemCount);
  if (wheelDeltaY < 0) return wrapIndex(currentIndex - 1, itemCount);
  return currentIndex;
}

export function getProgressPercent(index: number, itemCount: number) {
  if (itemCount <= 0) return 0;
  return ((wrapIndex(index, itemCount) + 1) / itemCount) * 100;
}

export function getExitDistance(viewportWidth: number, assetWidth: number, padding = 160) {
  return viewportWidth / 2 + assetWidth / 2 + padding;
}

function runStepperTests() {
  console.assert(getNextIndex(0, 100, 5) === 1, "scroll down should move to the next item");
  console.assert(getNextIndex(4, 100, 5) === 0, "scroll down should loop from last item to first item");
  console.assert(getNextIndex(2, -100, 5) === 1, "scroll up should move to the previous item");
  console.assert(getNextIndex(0, -100, 5) === 4, "scroll up should loop from first item to last item");
  console.assert(getNextIndex(2, 0, 5) === 2, "zero wheel delta should not move");
  console.assert(wrapIndex(7, 5) === 2, "wrapIndex should wrap positive overflow");
  console.assert(wrapIndex(-1, 5) === 4, "wrapIndex should wrap negative overflow");
  console.assert(wrapIndex(10, 5) === 0, "wrapIndex should wrap exact multiples to zero");
  console.assert(getProgressPercent(4, 5) === 100, "progress should reach 100% on the last visible item");
  console.assert(getProgressPercent(5, 5) === 20, "progress should loop cleanly after the last item");
  console.assert(getProgressPercent(-1, 5) === 100, "progress should wrap negative indices cleanly");
  console.assert(getExitDistance(1200, 320, 160) === 920, "exit distance should move the full asset beyond the right edge");
  console.assert(getExitDistance(390, 260, 120) === 445, "exit distance should work on small screens");
}

if (typeof window !== "undefined") {
  runStepperTests();
}

function useWheelStepper(itemCount: number) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);
  const locked = useRef(false);

  const advanceCycle = useCallback(() => {
    setCycle((currentCycle) => currentCycle + 1);
  }, []);

  const stepTo = useCallback(
    (nextIndex: number) => {
      setIndex(wrapIndex(nextIndex, itemCount));
      advanceCycle();
    },
    [advanceCycle, itemCount],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      const threshold = 18;

      if (Math.abs(event.deltaY) < threshold || locked.current) return;

      setIndex((currentIndex) => getNextIndex(currentIndex, event.deltaY, itemCount));
      advanceCycle();

      locked.current = true;
      window.setTimeout(() => {
        locked.current = false;
      }, 1120);
    };

    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
    };
  }, [advanceCycle, itemCount]);

  return { index, cycle, stepTo };
}
type Asset = {
  label: string;
  headline: string;
  color: string;
  shape: string;
  size: string;
  cluster?: boolean;
  glass?: boolean;
};
function AssetShape({ asset }: { asset: Asset }) {
  if (asset.cluster) {
    return (
      <div className={`relative ${asset.size}`}>
        <div className="absolute left-2 top-12 h-24 w-24 rounded-full bg-red-800 shadow-2xl shadow-black/25 md:h-32 md:w-32" />
        <div className="absolute left-20 top-0 h-28 w-28 rounded-full bg-red-500 shadow-2xl shadow-black/25 md:left-28 md:h-40 md:w-40" />
        <div className="absolute bottom-5 right-2 h-20 w-20 rounded-full bg-red-700 shadow-2xl shadow-black/25 md:h-28 md:w-28" />
        <div className="absolute left-24 top-8 h-12 w-12 rounded-full bg-white/50 blur-md" />
      </div>
    );
  }

  if (asset.glass) {
    return (
      <div className={`relative ${asset.size}`}>
        <div className="absolute left-1/2 top-0 h-12 w-36 -translate-x-1/2 rounded-full border-4 border-yellow-50/90 bg-white/30 backdrop-blur" />
        <div className="absolute left-1/2 top-10 h-44 w-24 -translate-x-1/2 border-x-4 border-yellow-50/90 bg-white/10 backdrop-blur md:h-56 md:w-28" />
        <div className="absolute bottom-0 left-1/2 h-16 w-44 -translate-x-1/2 rounded-2xl border-4 border-yellow-50/90 bg-white/30 backdrop-blur" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-yellow-100/30 blur-sm" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${asset.size} ${asset.color} ${asset.shape} shadow-2xl shadow-black/25`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/20 to-transparent" />
      <div className="absolute inset-x-6 top-5 h-10 rounded-full bg-white/50 blur-lg" />
      <div className="absolute bottom-4 left-1/2 h-1/2 w-2/3 -translate-x-1/2 rounded-full bg-black/15 blur-xl" />
      <div className="absolute inset-4 rounded-[inherit] border border-white/40" />
    </div>
  );
}

const itemVariants = {
  enter: {
    x: "-118vw",
    y: 20,
    rotate: -6,
    scale: 0.96,
    opacity: 1,
    filter: "blur(0px)",
  },
  center: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      mass: 0.9,
    },
  },
  // Natural fly-away: no nudge keyframes, just a spring to the computed off-screen distance
  exit: (exitDistance: number) => ({
    x: exitDistance,
    y: -40,
    rotate: 18,
    scale: 0.98,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: 0.12,
      type: "spring",
      // toned down speed for a smoother, less aggressive fly-away
      stiffness: 80,
      damping: 18,
      mass: 0.9,
      restDelta: 0.5,
    },
  }),
};

const impactVariants = {
  initial: { x: 0, scaleX: 1, scaleY: 1 },
  hit: {
    x: [0, 18, -8, 0],
    scaleX: [1, 0.94, 1.05, 1],
    scaleY: [1, 1.06, 0.97, 1],
    transition: { duration: 0.34, times: [0, 0.32, 0.72, 1], ease: "easeOut" },
  },
};

const titleVariants = {
  initial: { scale: 1, x: 0 },
  bump: {
    scale: [1, 1.04, 1],
    x: [0, 22, 0],
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function ScrollAnimationReplica() {
  const { index, cycle, stepTo } = useWheelStepper(assets.length);
  const active = assets[index];
  const [exitDistance, setExitDistance] = useState(1200);

  useEffect(() => {
    const updateExitDistance = () => {
      const viewportWidth = window.innerWidth;
      const largestAssetWidth = viewportWidth >= 768 ? 288 : 260;
      setExitDistance(getExitDistance(viewportWidth, largestAssetWidth, 220));
    };

    updateExitDistance();
    window.addEventListener("resize", updateExitDistance);

    return () => {
      window.removeEventListener("resize", updateExitDistance);
    };
  }, []);

  const progress = useMemo(() => getProgressPercent(index, assets.length), [index]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#eadc1d] text-black">
      <section className="relative grid h-screen place-items-center overflow-hidden bg-[#eadc1d] px-6">
        <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5 text-xs font-bold uppercase tracking-[0.35em] md:px-10">
          <span>01. Scroll animation</span>
          <span>Joyset</span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </header>

        <div className="absolute inset-0 opacity-35">
          <div className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-black" />
          <div className="absolute left-[54%] top-[16%] h-2 w-2 rounded-full bg-black" />
          <div className="absolute right-[7%] top-[30%] h-2 w-2 rounded-full bg-black" />
          <div className="absolute bottom-[18%] left-[42%] h-2 w-2 rounded-full bg-black" />
        </div>

        <motion.h1
          key={`title-${cycle}`}
          variants={titleVariants}
          initial="initial"
          animate="bump"
          className="pointer-events-none absolute left-[-1vw] top-[12vh] z-10 whitespace-nowrap text-[18vw] font-black leading-none tracking-[-0.12em] md:text-[17vw]"
        >
          {active.headline}
        </motion.h1>

        <div className="relative z-20 grid h-[70vh] w-full place-items-center">
          <AnimatePresence mode="sync" custom={exitDistance}>
            {/* NEXT ITEM (preview on left) */}
            <motion.div
              key={`next-${cycle}`}
              initial={{ x: "-60vw", scale: 0.55, opacity: 0.7 }}
              animate={{ x: "-35vw", scale: 0.6, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute grid place-items-center"
            >
              <AssetShape asset={assets[wrapIndex(index + 1, assets.length)]} />
            </motion.div>

            {/* ACTIVE ITEM */}
            <motion.div
              key={`${active.label}-${cycle}`}
              custom={exitDistance}
              variants={itemVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute grid place-items-center"
            >
              <AssetShape asset={active} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute bottom-24 left-1/2 z-40 flex -translate-x-1/2 gap-3">
          {assets.map((asset, itemIndex) => (
            <button
              key={asset.label}
              onClick={() => stepTo(itemIndex)}
              className={`h-2.5 rounded-full transition-all ${
                itemIndex === index ? "w-10 bg-black" : "w-2.5 bg-black/30 hover:bg-black/60"
              }`}
              aria-label={`Go to ${asset.label}`}
              type="button"
            />
          ))}
        </div>

        <div className="absolute bottom-7 left-6 z-40 h-1 w-[calc(100%-3rem)] overflow-hidden rounded-full bg-black/20 md:left-10 md:w-[calc(100%-5rem)]">
          <div className="h-full rounded-full bg-black transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>

        <div className="absolute bottom-12 left-6 z-40 max-w-md text-xs font-semibold uppercase tracking-[0.22em] md:left-10 md:text-sm">
          Each scroll tick keeps the previous asset visible until its full width crosses beyond the right edge.
        </div>
      </section>
    </main>
  );
}

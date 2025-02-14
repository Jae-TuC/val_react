import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import ReactConfetti from "react-confetti";
import { clsx } from "clsx";

import { useParams } from "react-router-dom";
import { HeartIcon, Pause, Play } from "lucide-react";
import BlurText from "./blurtext";
import AnimatedContent from "./animatedcontent";
import SplitText from "./splittext";
import ShinyText from "./shinnytext";
import { data } from "../lib/dummyData";
import Autoplay from "embla-carousel-autoplay";
import happyValentine3 from "../assets/music/track2.wav";

import Slideshow, { SlideshowContent, SlideshowItem } from "./slideshows";

interface CountUpProps {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2, // Duration of the animation in seconds
  className = "",
  startWhen = true,
  separator = "",
  onStart,
  onEnd,
}: CountUpProps) {
  // const [person, setPerson] = useState<(typeof data)[0] | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const [showConfetti, setShowConfetti] = useState(true);
  const ref = useRef<HTMLSpanElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  // Get the name from the URL
  const { name } = useParams();
  const personName = name?.split("@").join("").toLowerCase();
  // @ts-ignore
  const actualName = personName?.toLowerCase().includes(name?.toLowerCase());
  console.log(actualName);
  // const getName = () => {
  //   const actualName = name?.split("@").join("");

  //   return actualName?.toLowerCase();
  // };
  const getWriteUp = () => {
    const actualWriteUp = data.find((person) => person.name === name);

    if (actualWriteUp === undefined) {
      return "Love is not possession; it is freedom. It thrives in kindness, patience, and understanding. In the smallest moments, love speaks the loudest.";
    }
    return actualWriteUp?.writeUp;
  };

  const getImages = () => {
    const actualImages = data.find(
      (person) => person.name === name?.toLowerCase()
    );
    return actualImages?.images;
  };

  console.log(getImages());

  const getAudio = () => {
    const actualAudio = data.find((person) => person.name === name);

    return actualAudio?.music;
  };

  useEffect(() => {
    // Attempt to autoplay the audio when the component mounts
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.warn("Autoplay failed: User interaction required", error);
      });
    }
  }, []);

  const handleAudioPlay = () => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.warn("Audio playback failed", error);
        });
    }
  };

  const handleAudioPause = () => {
    if (audioRef.current) {
      audioRef.current.muted = true;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(false);
        })
        .catch((error) => {
          console.warn("Audio playback failed", error);
        });
    }
  };

  // Calculate damping and stiffness based on duration
  const damping = 20 + 40 * (1 / duration); // Adjust this formula for finer control
  const stiffness = 100 * (1 / duration); // Adjust this formula for finer control

  const springValue = useSpring(motionValue, {
    damping,
    stiffness,
  });

  const isInView = useInView(ref, { once: true, margin: "0px" });

  // Set initial text content to the initial value based on direction
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = String(direction === "down" ? to : from);
    }
  }, [from, to, direction]);

  // Start the animation when in view and startWhen is true
  useEffect(() => {
    if (isInView && startWhen) {
      if (typeof onStart === "function") {
        onStart();
      }

      const timeoutId = setTimeout(() => {
        motionValue.set(direction === "down" ? from : to);
      }, delay * 1000);

      const durationTimeoutId = setTimeout(() => {
        if (typeof onEnd === "function") {
          onEnd();
        }
        if (to === 100) {
          setShowConfetti(false);
        }
      }, delay * 1000 + duration * 1000 + 2200);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(durationTimeoutId);
      };
    }
  }, [
    isInView,
    startWhen,
    motionValue,
    direction,
    from,
    to,
    delay,
    onStart,
    onEnd,
    duration,
  ]);

  // Update text content with formatted number on spring value change
  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const options = {
          useGrouping: !!separator,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        };

        const formattedNumber = Intl.NumberFormat("en-US", options).format(
          Number(latest.toFixed(0))
        );

        ref.current.textContent = separator
          ? formattedNumber.replace(/,/g, separator)
          : formattedNumber;
      }
    });

    return () => unsubscribe();
  }, [springValue, separator]);

  const handleAnimationComplete = () => {
    console.log("Animation completed!");
  };

  return (
    <div className="relative w-full h-full">
      {showConfetti && (
        <div className="flex flex-col items-center justify-center h-screen">
          <span
            className={clsx(
              className,
              "text-8xl tracking-wider font-semibold text-[#d60000]"
            )}
            ref={ref}
          >
            {direction === "down" ? to : from}
          </span>
        </div>
      )}

      {!showConfetti && (
        <>
          <ReactConfetti
            width={1000}
            height={1000}
            className="absolute top-0 left-0 w-full h-full"
          />
          <div className="flex flex-col items-center justify-center h-screen pt-0">
            {getImages === undefined && <></>}
            {/* @ts-ignore */}
            {getImages() !== undefined && getImages()?.length > 0 ? (
              <div className="w-[300px] md:w-[400px] h-[300px] md:h-[400px] mb-6">
                <Slideshow
                  opts={{ loop: true }}
                  plugins={[plugin.current]}
                  className="w-[300px] md:w-[400px] h-[300px] md:h-[400px]"
                >
                  <SlideshowContent>
                    {getImages()?.map((image, index) => (
                      <SlideshowItem key={index} className="rounded-md">
                        <img
                          src={image}
                          alt="Image"
                          className=" w-[400px] h-[300px] md:h-[400px] object-cover"
                        />
                      </SlideshowItem>
                    ))}
                  </SlideshowContent>
                </Slideshow>
              </div>
            ) : (
              <></>
            )}
            <h1 className="inline-flex flex-col md:flex-row items-center gap-2 text-4xl md:text-6xl font-bold text-[#d60000]">
              Happy Valentine's{" "}
              <BlurText
                text="Day"
                delay={150}
                animateBy="words"
                direction="top"
                onAnimationComplete={handleAnimationComplete}
                className="text-4xl md:text-6xl text-white py-1.5 px-3 md:py-2 md:px-4 rounded-xl bg-[#d60000] mb-0"
              />
            </h1>
            <div className="mt-10 flex flex-col items-center gap-4">
              <AnimatedContent
                blur={true}
                duration={1000}
                easing="ease-out"
                initialOpacity={0}
              >
                {/* Anything placed inside this container will be fade into view */}
                <h1 className="inline-flex items-center text-4xl md:text-5xl uppercase font-semibold tracking-wider">
                  <SplitText text={personName} />
                  <HeartIcon className="w-20 h-20 stroke-[#c00000] fill-[#c00000] animate-pulse" />
                </h1>
              </AnimatedContent>
              <ShinyText
                text={String(getWriteUp())}
                speed={4}
                className="text-center text-[1rem] font-semibold px-2 leading-6 w-4/5 md:px-4 md:leading-7 md:w-3/5"
              />
            </div>
          </div>
        </>
      )}
      <div className="absolute bottom-[3.8rem] md:bottom-20 right-4 md:right-20 flex items-center gap-2">
        <audio
          ref={audioRef}
          src={getAudio() ? getAudio() : happyValentine3}
          autoPlay
          loop
        />
        {!isPlaying && (
          <button
            onClick={handleAudioPlay}
            className="p-[.8rem] md:p-6 rounded-full bg-[#d60000] gap-2"
          >
            <Play className="w-10 h-10" />
          </button>
        )}
        {isPlaying && (
          <button
            onClick={handleAudioPause}
            className="p-[.8rem] md:p-6 rounded-full bg-[#d60000] gap-2"
          >
            <Pause className="w-10 h-10" />
          </button>
        )}
      </div>
    </div>
  );
}

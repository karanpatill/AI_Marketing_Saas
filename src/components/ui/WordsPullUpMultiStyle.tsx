"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface TextSegment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: TextSegment[];
  className?: string;
}

export default function WordsPullUpMultiStyle({ segments, className = "" }: WordsPullUpMultiStyleProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={`inline-flex flex-wrap justify-center ${className}`}
    >
      {segments.map((segment, segmentIndex) => {
        const words = segment.text.split(" ");
        return (
          <span key={`segment-${segmentIndex}`} className={segment.className}>
            {words.map((word, wordIndex) => (
              <motion.span
                key={`${segmentIndex}-${wordIndex}`}
                variants={item}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.div>
  );
}

"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface AnimatedLetterProps {
  text: string;
  className?: string;
}

export default function AnimatedLetter({ text, className = "" }: AnimatedLetterProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);

  // ONE shared scroll tracker — not one per character
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.3"],
  });

  const words = text.split(" ");

  return (
    <p ref={containerRef} className={className} style={{ display: "flex", flexWrap: "wrap", gap: "0.25em" }}>
      {words.map((word, i) => {
        // Map each word to a portion of the scroll range
        const total = words.length;
        const start = i / total;
        const end = Math.min(1, (i + 2) / total);
        return (
          <WordReveal
            key={i}
            word={word}
            scrollYProgress={scrollYProgress}
            start={start}
            end={end}
          />
        );
      })}
    </p>
  );
}

// Isolated child so hooks are at top-level per component instance
function WordReveal({
  word,
  scrollYProgress,
  start,
  end,
}: {
  word: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);
  return (
    <motion.span style={{ opacity }}>
      {word}
    </motion.span>
  );
}

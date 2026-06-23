import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

// ibelick-style mouse-follow spotlight
export function MouseSpotlight({ size = 500 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parent, setParent] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, { bounce: 0, damping: 20, stiffness: 150 });
  const mouseY = useSpring(0, { bounce: 0, damping: 20, stiffness: 150 });
  const left = useTransform(mouseX, x => `${x - size / 2}px`);
  const top  = useTransform(mouseY, y => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const p = containerRef.current.parentElement;
      if (p) { p.style.position = 'relative'; setParent(p); }
    }
  }, []);

  const onMove = useCallback((e: MouseEvent) => {
    if (!parent) return;
    const { left: l, top: t } = parent.getBoundingClientRect();
    mouseX.set(e.clientX - l);
    mouseY.set(e.clientY - t);
  }, [mouseX, mouseY, parent]);

  useEffect(() => {
    if (!parent) return;
    parent.addEventListener('mousemove', onMove);
    parent.addEventListener('mouseenter', () => setIsHovered(true));
    parent.addEventListener('mouseleave', () => setIsHovered(false));
    return () => {
      parent.removeEventListener('mousemove', onMove);
      parent.removeEventListener('mouseenter', () => setIsHovered(true));
      parent.removeEventListener('mouseleave', () => setIsHovered(false));
    };
  }, [parent, onMove]);

  return (
    <motion.div
      ref={containerRef}
      className="pointer-events-none absolute rounded-full blur-3xl transition-opacity duration-300"
      style={{
        width: size,
        height: size,
        left,
        top,
        opacity: isHovered ? 1 : 0,
        background: 'radial-gradient(circle at center, rgba(99,102,241,0.25) 0%, rgba(59,130,246,0.15) 40%, transparent 70%)',
      }}
    />
  );
}

// Aceternity-style animated SVG spotlight sweep
export function AceternitySpotlight({
  className,
  fill = 'white',
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      className={[
        'animate-spotlight pointer-events-none absolute z-[1] opacity-0 h-[169%] w-[138%] lg:w-[84%]',
        className,
      ].filter(Boolean).join(' ')}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#spotlight-filter)">
        <ellipse
          cx="1924.71" cy="273.501" rx="1924.71" ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter id="spotlight-filter" x="0.860352" y="0.838989"
          width="3785.16" height="2840.26"
          filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur"/>
        </filter>
      </defs>
    </svg>
  );
}

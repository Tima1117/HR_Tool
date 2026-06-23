import { Variants, Transition } from 'framer-motion';

export const SPRING: Transition = { type: 'spring', stiffness: 380, damping: 30 };
export const SMOOTH: Transition = { duration: 0.22, ease: [0.4, 0, 0.2, 1] };

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const staggerFast: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.04 } },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: SMOOTH },
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
};

export const slideLeft: Variants = {
  initial: { opacity: 0, x: -12 },
  animate: { opacity: 1, x: 0, transition: SMOOTH },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.94 },
  animate: { opacity: 1, scale: 1, transition: SPRING },
};

export const cardHover = {
  whileHover: { y: -2, scale: 1.005, transition: SPRING },
  whileTap:   { scale: 0.98, transition: { duration: 0.1 } },
};

export const buttonHover = {
  whileHover: { scale: 1.02, transition: SPRING },
  whileTap:   { scale: 0.96, transition: { duration: 0.1 } },
};

export const subtleHover = {
  whileHover: { y: -1, transition: SPRING },
  whileTap:   { scale: 0.99 },
};

'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 8,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
    exit: {
        opacity: 0,
        y: -8,
        transition: {
            duration: 0.2,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

export const PageTransition = ({ children }: PageTransitionProps) => {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
};

// Stagger children animation wrapper
interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export const StaggerContainer = ({
    children,
    staggerDelay = 0.05,
    className = '',
}: StaggerContainerProps) => (
    <motion.div
        initial="initial"
        animate="animate"
        className={className}
        variants={{
            initial: {},
            animate: {
                transition: {
                    staggerChildren: staggerDelay,
                },
            },
        }}
    >
        {children}
    </motion.div>
);

// Stagger item wrapper
interface StaggerItemProps {
    children: ReactNode;
    className?: string;
}

export const StaggerItem = ({ children, className = '' }: StaggerItemProps) => (
    <motion.div
        className={className}
        variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                },
            },
        }}
    >
        {children}
    </motion.div>
);

// Fade in animation wrapper
interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}

export const FadeIn = ({
    children,
    delay = 0,
    duration = 0.3,
    className = '',
}: FadeInProps) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
    >
        {children}
    </motion.div>
);

// Scale in animation wrapper
interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export const ScaleIn = ({ children, delay = 0, className = '' }: ScaleInProps) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
            delay,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export default PageTransition;

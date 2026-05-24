import { CircularProgress } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';

export function FullScreenLoader({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          aria-label="Loading application"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative"
          >
            <CircularProgress
              size="lg"
              color="primary"
              className="w-16 h-16"
              aria-label="Loading spinner"
            />
            <motion.div
              className="absolute inset-0"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            ></motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeechRecognitionButtonProps {
  isListening: boolean;
  speechReady: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SpeechRecognitionButton: React.FC<SpeechRecognitionButtonProps> = ({
  isListening,
  speechReady,
  isSpeaking,
  onToggle,
  disabled = false,
  size = 'md',
  className = '',
}) => {

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <Button
      onClick={onToggle}
      className={`${sizeClasses[size]} rounded-full transition-all duration-200 relative overflow-hidden ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-110'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg'
      } ${className}`}
      disabled={disabled}
    >
      {speechReady ? (
        // Speech-reactive waves inside the button
        <div className="flex items-center justify-center space-x-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              className="bg-white rounded-full"
              animate={{
                height: isSpeaking
                  ? [6, 18, 6] // Active: oscillate to higher waves
                  : [4, 6, 4], // Idle: small movements
                opacity: isSpeaking ? [0.4, 1, 0.4] : [0.6, 0.8, 0.6],
              }}
              transition={{
                duration: isSpeaking ? 0.6 : 1.5,
                repeat: Infinity,
                delay: i * 0.06,
                ease: "easeInOut",
              }}
              style={{
                width: '2px',
              }}
            />
          ))}
        </div>
      ) : (
        // Microphone icon when not ready
        <motion.div
          animate={isListening ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, repeat: isListening ? Infinity : 0 }}
        >
          {isListening ? (
            <MicOff className={iconSizes[size]} />
          ) : (
            <Mic className={iconSizes[size]} />
          )}
        </motion.div>
      )}
    </Button>
  );
};

export default SpeechRecognitionButton;

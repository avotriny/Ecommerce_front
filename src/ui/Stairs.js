import { motion } from "framer-motion";

// Animation variants for stair movement
const stairAnimation = {
  initial: {
    top: "0%",  // Starting at the top
  },
  animate: {
    top: "100%", // Move down to 100%
  },
  exit: {
    top: "0%", // Return to the top on exit
  },
};

// Function to reverse the index for delayed animations
const reverseIndex = (index) => {
  const totalSteps = 6; // Total number of steps
  return totalSteps - index - 1;
};

// Stairs component
const Stairs = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index} // Ensure unique keys for each element
          variants={stairAnimation} // Apply animation variants
          initial="initial" // Initial state
          animate="animate" // Animation on mount
          exit="exit" // Exit animation
          transition={{
            duration: 0.4, // Duration of the animation
            ease: "easeInOut", // Easing function
            delay: reverseIndex(index) * 0.1, // Delayed animation for each step
          }}
          className="absolute w-full h-1/6 bg-white" // Adjust height to create stair effect
          style={{ top: `${index * 16.67}%` }} // Position each "stair"
        />
      ))}
    </div>
  );
};

export default Stairs;

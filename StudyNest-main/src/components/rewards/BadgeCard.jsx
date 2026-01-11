import { motion } from 'framer-motion';

const BadgeCard = ({ badge }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="glass p-4 rounded-2xl flex flex-col items-center text-center relative group"
    >
      <div className={`w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl relative ${badge.unlocked ? 'bg-gradient-to-br from-accent/20 to-accent/5' : 'bg-white/5 grayscale'}`}>
        {badge.unlocked && <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full animate-pulse" />}
        {badge.icon}
      </div>
      
      <h4 className="font-bold text-sm mb-1">{badge.title}</h4>
      <p className="text-xs text-muted mb-3">{badge.description}</p>
      
      {!badge.unlocked && (
        <div className="w-full h-1.5 bg-bg1 rounded-full overflow-hidden mt-auto">
            <div 
                className="h-full bg-accent" 
                style={{ width: `${(badge.progress / badge.max) * 100}%` }} 
            />
        </div>
      )}
      
      {badge.unlocked && <span className="text-xs text-accent font-bold mt-auto">Earned!</span>}
    </motion.div>
  );
};

export default BadgeCard;

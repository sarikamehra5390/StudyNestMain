import { motion } from 'framer-motion';

const LevelProgress = ({ level, xp, nextLevelXp }) => {
  const progress = (xp / nextLevelXp) * 100;

  return (
    <div className="glass p-6 rounded-3xl w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex justify-between items-end mb-4">
        <div>
          <div className="text-sm text-muted mb-1">Current Level</div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2">
            Level {level}: Warrior
          </h2>
        </div>
        <div className="text-right">
            <div className="text-sm text-muted">Next: Planet Protector</div>
            <div className="text-accent font-mono">{xp} / {nextLevelXp} XP</div>
        </div>
      </div>

      <div className="h-4 bg-bg1/50 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-accent to-accent2 shadow-[0_0_15px_rgba(242,161,74,0.5)]"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-muted transition-colors">
            View Level Benefits &rarr;
        </button>
      </div>
    </div>
  );
};

export default LevelProgress;

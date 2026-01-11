import { Lock, Unlock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RewardItemCard = ({ reward, userCoins, onUnlock }) => {
  const isAffordable = userCoins >= reward.cost;
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`glass p-5 rounded-3xl flex flex-col relative overflow-hidden group ${!reward.unlocked && !isAffordable ? 'opacity-70' : ''}`}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-3xl">
        {reward.icon}
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold text-lg leading-tight mb-1">{reward.name}</h3>
        <p className={`font-medium ${isAffordable || reward.unlocked ? 'text-accent' : 'text-muted'}`}>
            {reward.cost} Coins
        </p>
      </div>

      <button 
        onClick={() => onUnlock(reward.id)}
        disabled={reward.unlocked || !isAffordable}
        className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            reward.unlocked 
            ? 'bg-green-500/20 text-green-300 cursor-default' 
            : isAffordable 
                ? 'bg-accent text-bg1 hover:shadow-[0_0_15px_rgba(242,161,74,0.4)] hover:brightness-110' 
                : 'bg-white/5 text-muted cursor-not-allowed'
        }`}
      >
        {reward.unlocked ? (
            <>Unlocked <Check className="w-4 h-4" /></>
        ) : (
            <>Unlock {isAffordable ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</>
        )}
      </button>
    </motion.div>
  );
};

export default RewardItemCard;

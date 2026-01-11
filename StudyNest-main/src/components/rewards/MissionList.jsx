import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const MissionList = ({ missions, onComplete }) => {
  return (
    <div className="glass p-6 rounded-3xl w-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        📅 Daily Missions
      </h3>
      
      <div className="space-y-3">
        {missions.map((mission) => (
          <motion.div
            key={mission.id}
            initial={false}
            animate={{ backgroundColor: mission.completed ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0)' }}
            className={`p-3 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-colors cursor-pointer ${mission.completed ? 'opacity-60' : ''}`}
            onClick={() => !mission.completed && onComplete(mission.id)}
          >
            <div className="flex items-center gap-3">
                <div className={`transition-colors ${mission.completed ? 'text-green-400' : 'text-muted group-hover:text-accent'}`}>
                    {mission.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <div>
                    <p className={`font-medium ${mission.completed ? 'line-through text-muted' : ''}`}>{mission.title}</p>
                    <div className="flex gap-2 mt-1">
                        {mission.rewards.xp && <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">+{mission.rewards.xp} XP</span>}
                        {mission.rewards.coins && <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded">+{mission.rewards.coins} Coins</span>}
                    </div>
                </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MissionList;

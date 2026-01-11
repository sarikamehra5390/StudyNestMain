import { motion } from 'framer-motion';

const StreakCalendar = ({ streakData = [] }) => {
  // Mock calendar grid generation
  const days = Array.from({ length: 28 }, (_, i) => {
    // Random activity level 0-4
    const activity = Math.floor(Math.random() * 5); 
    return { day: i + 1, activity };
  });

  const getActivityColor = (level) => {
    switch (level) {
      case 0: return 'bg-white/5';
      case 1: return 'bg-accent/20';
      case 2: return 'bg-accent/40';
      case 3: return 'bg-accent/70';
      case 4: return 'bg-accent';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="glass p-6 rounded-3xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold">Activity Streak</h3>
        <div className="flex gap-4 text-sm text-muted">
          <span>Current: <span className="text-accent font-bold">7 Days</span></span>
          <span>Longest: <span className="text-accent font-bold">14 Days</span></span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {days.map((d, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.2 }}
            className={`aspect-square rounded-lg ${getActivityColor(d.activity)} relative group cursor-pointer`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg1 border border-white/10 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {d.activity === 0 ? 'No activity' : `Completed ${d.activity} sessions`}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className={`w-3 h-3 rounded ${getActivityColor(l)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default StreakCalendar;

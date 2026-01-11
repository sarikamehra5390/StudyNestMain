import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, label, value, subLabel, color }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 rounded-2xl flex items-center gap-4 flex-1 min-w-[150px]"
    >
      <div className={`w-12 h-12 rounded-full ${color} bg-opacity-20 flex items-center justify-center text-xl`}>
        <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-sm text-muted">{label}</p>
        {subLabel && <p className="text-xs text-muted opacity-70">{subLabel}</p>}
      </div>
    </motion.div>
  );
};

export default StatsCard;

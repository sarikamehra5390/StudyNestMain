import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Star, Coins, CheckSquare, Music, Image, Sticker, Zap, Leaf, Snowflake, Award, Zap as ZapIcon, Timer, ScanLine, Trophy } from 'lucide-react';
import StatsCard from '../components/rewards/StatsCard';
import StreakCalendar from '../components/rewards/StreakCalendar';
import LevelProgress from '../components/rewards/LevelProgress';
import RewardItemCard from '../components/rewards/RewardItemCard';
import BadgeCard from '../components/rewards/BadgeCard';
import MissionList from '../components/rewards/MissionList';

const Rewards = () => {
  // --- State Initialization with LocalStorage ---
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('sn_userStats');
    return saved ? JSON.parse(saved) : {
      streak: 7,
      xp: 630,
      coins: 350,
      tasksCompleted: 3,
      level: 5,
    };
  });

  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('sn_missions');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Complete 2 Pomodoro Focus sessions', completed: true, rewards: { xp: 50, coins: 20 } },
      { id: 2, title: 'Scan 1 product', completed: false, rewards: { xp: 30, coins: 15 } },
      { id: 3, title: 'Finish 1 teaching quiz', completed: false, rewards: { xp: 40, coins: 20 } },
      { id: 4, title: 'Earn 50 XP', completed: true, rewards: { xp: 0, coins: 10 } },
      { id: 5, title: 'Log in today', completed: true, rewards: { xp: 10, coins: 5 } },
    ];
  });

  const [rewardsList, setRewardsList] = useState(() => {
    const saved = localStorage.getItem('sn_unlockedRewards');
    const initialRewards = [
      { id: 1, name: "LoFi Beats Pack", cost: 150, icon: <Music />, unlocked: true },
      { id: 2, name: "Cozy Wallpaper Pack", cost: 200, icon: <Image />, unlocked: false },
      { id: 3, name: "Cat Sticker Pack", cost: 120, icon: <Sticker />, unlocked: false },
      { id: 4, name: "Lamp Glow Theme", cost: 300, icon: <Zap />, unlocked: false },
      { id: 5, name: "Avatar Frame", cost: 250, icon: <Leaf />, unlocked: false },
      { id: 6, name: "Streak Freeze", cost: 500, icon: <Snowflake />, unlocked: false },
    ];
    
    if (saved) {
        const unlockedIds = JSON.parse(saved);
        return initialRewards.map(r => unlockedIds.includes(r.id) ? { ...r, unlocked: true } : r);
    }
    return initialRewards;
  });

  // --- Effects for LocalStorage ---
  useEffect(() => {
    localStorage.setItem('sn_userStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('sn_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    const unlockedIds = rewardsList.filter(r => r.unlocked).map(r => r.id);
    localStorage.setItem('sn_unlockedRewards', JSON.stringify(unlockedIds));
  }, [rewardsList]);

  // --- Actions ---
  const handleCompleteMission = (id) => {
    const mission = missions.find(m => m.id === id);
    if (!mission) return;

    // Confetti Effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F2A14A', '#FFCE8A', '#F4F1FF']
    });

    // Update Stats
    setStats(prev => ({
      ...prev,
      xp: prev.xp + mission.rewards.xp,
      coins: prev.coins + mission.rewards.coins,
      tasksCompleted: prev.tasksCompleted + 1
    }));

    // Update Mission Status
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
  };

  const handleUnlockReward = (id) => {
    const reward = rewardsList.find(r => r.id === id);
    if (!reward || stats.coins < reward.cost) return;

    // Deduct Coins
    setStats(prev => ({ ...prev, coins: prev.coins - reward.cost }));
    
    // Unlock Reward
    setRewardsList(prev => prev.map(r => r.id === id ? { ...r, unlocked: true } : r));
    
    // Success feedback (could be a toast)
    confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.7 },
        colors: ['#4ADE80', '#ffffff']
    });
  };

  // Mock Badges Data
  const badges = [
    { id: 1, title: 'Focus Master', description: 'Complete 50 Pomodoro sessions', icon: <Timer />, progress: 35, max: 50, unlocked: false },
    { id: 2, title: 'Scanner', description: 'Scan 10 items', icon: <ScanLine />, progress: 10, max: 10, unlocked: true },
    { id: 3, title: 'Streak Legend', description: 'Maintain a 30-day streak', icon: <Flame />, progress: 7, max: 30, unlocked: false },
    { id: 4, title: 'Quiz Champ', description: 'Score 100% on 5 quizzes', icon: <Award />, progress: 2, max: 5, unlocked: false },
    { id: 5, title: 'Early Bird', description: 'Complete a session before 8 AM', icon: <ZapIcon />, progress: 1, max: 1, unlocked: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      {/* 1. Header Stats Bar */}
      <div className="flex flex-wrap gap-4">
        <StatsCard icon={Flame} label="Current Streak" value={`${stats.streak} Days`} color="text-orange-500 bg-orange-500" />
        <StatsCard icon={Star} label="XP Today" value={stats.xp} color="text-yellow-400 bg-yellow-400" />
        <StatsCard icon={Coins} label="Coins" value={stats.coins} color="text-yellow-500 bg-yellow-500" />
        <StatsCard icon={CheckSquare} label="Daily Tasks" value={`${stats.tasksCompleted}/5`} color="text-green-400 bg-green-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
            {/* 2. Level Progress */}
            <LevelProgress level={stats.level} xp={stats.xp} nextLevelXp={1000} />
            
            {/* 3. Rewards Store */}
            <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-accent" /> Rewards Store
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewardsList.map(reward => (
                        <RewardItemCard 
                            key={reward.id} 
                            reward={reward} 
                            userCoins={stats.coins}
                            onUnlock={handleUnlockReward}
                        />
                    ))}
                </div>
            </section>

             {/* 4. Achievements */}
             <section>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-accent" /> Badges & Achievements
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badges.map(badge => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))}
                </div>
             </section>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
            {/* 5. Streak Calendar */}
            <StreakCalendar />

            {/* 6. Daily Missions */}
            <MissionList missions={missions} onComplete={handleCompleteMission} />
        </div>
      </div>
    </motion.div>
  );
};

export default Rewards;
import { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  // --- Initial State Load ---
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('sn_userStats');
    return saved ? JSON.parse(saved) : {
      streak: 0,
      streakLongest: 0,
      xp: 0,
      xpTotal: 0,
      coins: 0,
      level: 1,
      tasksCompleted: 0,
      lastActivityDate: null,
      activityDates: [] // Array of YYYY-MM-DD
    };
  });

  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('sn_missions');
    const defaultMissions = [
      { id: 1, title: 'Complete 2 Pomodoro sessions', completed: false, rewards: { xp: 100, coins: 40 }, target: 2, progress: 0 },
      { id: 2, title: 'Scan 1 item', completed: false, rewards: { xp: 30, coins: 15 }, target: 1, progress: 0 },
      { id: 3, title: 'Finish 1 quiz', completed: false, rewards: { xp: 40, coins: 20 }, target: 1, progress: 0 },
      { id: 4, title: 'Earn 50 XP', completed: false, rewards: { xp: 20, coins: 10 }, target: 50, progress: 0 },
      { id: 5, title: 'Log in today', completed: false, rewards: { xp: 10, coins: 5 }, target: 1, progress: 0 },
    ];
    return saved ? JSON.parse(saved) : defaultMissions;
  });

  const [unlockedRewards, setUnlockedRewards] = useState(() => {
    const saved = localStorage.getItem('sn_unlockedRewards');
    return saved ? JSON.parse(saved) : []; // Array of reward IDs
  });

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('sn_userStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('sn_missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('sn_unlockedRewards', JSON.stringify(unlockedRewards));
  }, [unlockedRewards]);

  // --- Streak Logic Check on Mount ---
  useEffect(() => {
    checkStreakValidity();
  }, []);

  const checkStreakValidity = () => {
    if (!stats.lastActivityDate) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = new Date(stats.lastActivityDate);
    const currentDate = new Date(today);
    
    // Calculate difference in days
    const diffTime = Math.abs(currentDate - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Missed a day (or more) -> Reset streak
      setStats(prev => ({
        ...prev,
        streak: 0
      }));
    }
    // If diffDays === 1 (Yesterday), streak is safe but not incremented until activity today
    // If diffDays === 0 (Today), streak is safe
  };

  // --- Actions ---

  const logActivity = (type, xpEarned = 0, coinsEarned = 0) => {
    const today = new Date().toISOString().split('T')[0];
    
    setStats(prev => {
      let newStreak = prev.streak;
      let newActivityDates = [...prev.activityDates];
      let newLastDate = prev.lastActivityDate;

      // Check if activity already logged today
      const alreadyLoggedToday = prev.lastActivityDate === today;

      if (!alreadyLoggedToday) {
        // It's a new day of activity
        // Check if yesterday was active to increment streak
        if (prev.lastActivityDate) {
            const lastDate = new Date(prev.lastActivityDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                newStreak += 1;
            } else {
                // Gap > 1 day or first activity after reset
                newStreak = 1; 
            }
        } else {
            // First ever activity
            newStreak = 1;
        }
        
        newLastDate = today;
        newActivityDates.push(today);
      }

      // XP Level Logic (Simple: Level up every 1000 XP)
      const newXpTotal = prev.xpTotal + xpEarned;
      const newLevel = Math.floor(newXpTotal / 1000) + 1;

      // Trigger Confetti if level up or streak increase
      if ((!alreadyLoggedToday && newStreak > prev.streak) || newLevel > prev.level) {
         confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F2A14A', '#FFCE8A', '#F4F1FF']
         });
      }

      return {
        ...prev,
        streak: newStreak,
        streakLongest: Math.max(newStreak, prev.streakLongest),
        xp: prev.xp + xpEarned, // Daily XP (could be total current XP for level)
        xpTotal: newXpTotal,
        coins: prev.coins + coinsEarned,
        level: newLevel,
        lastActivityDate: newLastDate,
        activityDates: newActivityDates,
        tasksCompleted: prev.tasksCompleted + 1 // Simply incrementing total tasks
      };
    });
  };

  const completeMission = (id) => {
    const mission = missions.find(m => m.id === id);
    if (!mission || mission.completed) return;

    logActivity('mission', mission.rewards.xp, mission.rewards.coins);

    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
    
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4ADE80', '#F2A14A']
    });
  };

  // Check Log in mission
  useEffect(() => {
    const loginMission = missions.find(m => m.id === 5);
    if (loginMission && !loginMission.completed) {
        completeMission(5);
    }
  }, []);

  const unlockReward = (reward) => {
    if (stats.coins >= reward.cost && !unlockedRewards.includes(reward.id)) {
        setStats(prev => ({ ...prev, coins: prev.coins - reward.cost }));
        setUnlockedRewards(prev => [...prev, reward.id]);
        
        confetti({
            particleCount: 50,
            spread: 40,
            origin: { y: 0.7 },
            colors: ['#4ADE80', '#ffffff']
        });
        return true;
    }
    return false;
  };

  return (
    <UserContext.Provider value={{ 
        stats, 
        missions, 
        unlockedRewards, 
        logActivity, 
        completeMission, 
        unlockReward 
    }}>
      {children}
    </UserContext.Provider>
  );
};

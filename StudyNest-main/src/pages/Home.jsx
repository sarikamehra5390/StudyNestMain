import { Play, Pause, SkipForward, BookOpen, Leaf, Trophy, Mic, Search, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-accent2">
            <span>✨</span> Your Cozy Study Space
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Cozy <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2">Study Zone</span>
          </h1>
          
          <p className="text-lg text-muted max-w-xl leading-relaxed">
            Relax, focus, and enjoy the vibe. Join the ultimate environmental adventure and save our planet, one chill session at a time.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/pomodoro" className="px-8 py-4 rounded-2xl bg-accent text-bg1 font-bold text-lg hover:shadow-[0_0_30px_rgba(242,161,74,0.6)] transition-all transform hover:-translate-y-1">
              Start Focusing
            </Link>
            <Link to="/eco-scan" className="px-8 py-4 rounded-2xl glass font-bold text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1 border border-white/10">
              Attention Detector
            </Link>
          </div>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 relative flex justify-center"
        >
            <div className="relative w-80 h-80 md:w-96 md:h-96">
                 {/* Glow behind */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 blur-[80px] rounded-full"></div>
                 
                 {/* Illustration Placeholders */}
                 <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {/* Lamp */}
                    <div className="absolute left-10 bottom-10 w-4 h-48 bg-white/10 rounded-full flex flex-col justify-end items-center">
                        <div className="w-12 h-4 bg-accent rounded-t-lg mb-0.5"></div>
                        <div className="absolute top-0 w-24 h-16 bg-accent2 rounded-t-full opacity-90 shadow-[0_10px_60px_rgba(255,206,138,0.5)] transform -translate-x-4"></div>
                        <div className="absolute -bottom-2 w-16 h-4 bg-accent rounded-full"></div>
                    </div>
                    {/* Cat */}
                    <div className="absolute right-10 bottom-0 w-32 h-24 bg-gradient-to-br from-orange-300 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg animate-float">
                         <div className="absolute -top-4 left-4 w-6 h-6 bg-orange-400 rotate-45 rounded-sm"></div>
                         <div className="absolute -top-4 right-4 w-6 h-6 bg-orange-400 rotate-45 rounded-sm"></div>
                         <div className="text-bg1 font-bold text-xl relative top-2">^ ◡ ^</div>
                    </div>
                    <div className="absolute top-10 right-20 text-accent2 font-bold animate-pulse text-xl">Zzz...</div>
                 </div>
            </div>
        </motion.div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          { title: "The Focus Guardian", icon: <Search className="w-8 h-8 text-accent" />, desc: "When your attention wanders, StudyNest notices and gently guides you back to studying." },
          { title: "The Expert Sparring Partner", icon: <Mic className="w-8 h-8 text-green-400" />, desc: "Our AI-driven Viva engages you in live dialogue, tests your understanding, and sharpens your explanations into confident answers." },
          { title: "Focus Rush", icon: <Gamepad2 className="w-8 h-8 text-yellow-400" />, desc: "We turn studying into a rewarding quest earn XP, hit focus milestones, and unlock rewards as your progress becomes visible." }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-muted">{feature.desc}</p>
          </motion.div>
        ))}
      </section>

{/* How It Works */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Three simple steps to transform your study sessions into productive adventures
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: "01", 
              title: "Set Your Goal", 
              desc: "Choose your study duration and topic. Our AI adapts to your learning style and creates a personalized focus plan.",
              color: "from-blue-500 to-purple-500"
            },
            { 
              step: "02", 
              title: "Stay in the Zone", 
              desc: "Our attention detector monitors your focus in real-time, keeping distractions at bay while you immerse yourself in learning.",
              color: "from-accent to-orange-500"
            },
            { 
              step: "03", 
              title: "Level Up & Earn", 
              desc: "Complete sessions, ace viva challenges, and watch your XP grow. Unlock badges, plant trees, and celebrate your progress.",
              color: "from-green-400 to-emerald-500"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="relative space-y-4"
            >
              <div className={`text-6xl font-black bg-gradient-to-br ${item.color} text-transparent bg-clip-text`}>
                {item.step}
              </div>
              <h3 className="text-2xl font-bold">{item.title}</h3>
              <p className="text-muted leading-relaxed">{item.desc}</p>
              
              {idx < 2 && (
                <div className="hidden md:block absolute top-12 -right-4 text-accent2 text-4xl">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      



      {/* CTA Section */}
      <section className="text-center space-y-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-bold">
            Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2">Study Life?</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Join thousands of students who are crushing their goals while making a positive impact on the planet.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/eco-scan" className="px-10 py-5 rounded-2xl bg-accent text-bg1 font-bold text-lg hover:shadow-[0_0_40px_rgba(242,161,74,0.7)] transition-all transform hover:-translate-y-1">
              Get Started
            </Link>
            <button className="px-10 py-5 rounded-2xl glass font-bold text-lg hover:bg-white/10 transition-all transform hover:-translate-y-1 border border-white/10">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>


    </div>
  );
};

export default Home;

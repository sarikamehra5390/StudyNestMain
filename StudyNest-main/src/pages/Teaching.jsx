import { useState } from 'react';
import { Book, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const lessons = [
    { id: 1, title: "Recycling Basics", content: "Learn what can and cannot be recycled. Always clean your containers!" },
    { id: 2, title: "Reduce Carbon Footprint", content: "Walking, biking, and using public transit helps reduce emissions." },
    { id: 3, title: "Energy Saving", content: "Turn off lights when leaving a room and use LED bulbs." },
    { id: 4, title: "Sustainable Shopping", content: "Buy locally sourced products and bring your own bags." },
    { id: 5, title: "Water Conservation", content: "Fix leaks and take shorter showers to save water." },
];

const Teaching = () => {
  const [activeLesson, setActiveLesson] = useState(lessons[0]);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <div className="md:w-80 glass rounded-3xl p-6 overflow-y-auto h-full">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Book className="w-5 h-5 text-accent" /> Modules
            </h2>
            <div className="space-y-2">
                {lessons.map((lesson) => (
                    <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between group ${
                            activeLesson.id === lesson.id 
                            ? 'bg-accent text-bg1 font-bold' 
                            : 'hover:bg-white/5 text-muted'
                        }`}
                    >
                        <span>{lesson.id}. {lesson.title}</span>
                        {activeLesson.id === lesson.id && <ChevronRight className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <motion.div 
            key={activeLesson.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 glass rounded-3xl p-8 md:p-12 overflow-y-auto relative"
        >
            <span className="absolute top-8 right-8 text-9xl font-bold text-white/5 select-none -z-10">
                {activeLesson.id}
            </span>
            
            <h1 className="text-4xl font-bold mb-6">{activeLesson.title}</h1>
            <p className="text-lg text-muted leading-relaxed mb-10">
                {activeLesson.content}
            </p>
            
            {/* Mini Quiz Mock */}
            <div className="bg-bg1/50 p-6 rounded-2xl border border-white/10">
                <h3 className="font-bold mb-4">Quick Quiz</h3>
                <div className="space-y-3">
                    <p className="mb-4 text-sm">Which action is best for this topic?</p>
                    <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm">
                        A) Ignore the problem
                    </button>
                    <button className="w-full text-left p-3 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-sm flex justify-between">
                        B) Follow the guidelines above
                        <CheckCircle2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
export default Teaching;

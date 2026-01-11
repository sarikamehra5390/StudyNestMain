import { Upload, ScanLine, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const EcoScan = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
        setScanning(false);
        setResult({
            score: 85,
            footprint: '1.2 kg',
            status: 'Good',
            tips: ['Recyclable packaging found', 'Locally sourced ingredients']
        });
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-10 pt-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
        >
            <h1 className="text-4xl font-bold">Eco Scanner</h1>
            <p className="text-muted">Scan products to analyze their environmental impact.</p>
        </motion.div>

        {/* Scanner Area */}
        <div className="w-full aspect-video glass rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-white/20 group hover:border-accent/50 transition-colors">
            {scanning && (
                <motion.div 
                    initial={{ top: 0 }}
                    animate={{ top: "100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 w-full h-1 bg-accent shadow-[0_0_20px_#F2A14A]"
                />
            )}
            
            {!result && !scanning && (
                <div className="text-center p-8 cursor-pointer" onClick={handleScan}>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="font-bold text-lg">Upload Product Image</h3>
                    <p className="text-sm text-muted">or drag and drop here</p>
                </div>
            )}

            {scanning && (
                <div className="text-accent animate-pulse font-mono">Analyzing composition...</div>
            )}

            {result && !scanning && (
                 <div className="flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500">
                        <span className="text-2xl font-bold text-green-400">{result.score}</span>
                    </div>
                    <h3 className="text-xl font-bold">Eco Score: Excellent</h3>
                    <button onClick={() => setResult(null)} className="text-sm text-muted hover:text-text underline">Scan Another</button>
                 </div>
            )}
        </div>

        {/* Results Details */}
        {result && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full glass p-8 rounded-3xl space-y-6"
            >
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <span className="text-muted">Carbon Footprint</span>
                    <span className="font-bold text-lg">{result.footprint} CO2e</span>
                </div>
                
                <div>
                    <h4 className="font-bold mb-4 flex items-center gap-2">
                        <ScanLine className="w-5 h-5 text-accent" /> Analysis Insights
                    </h4>
                    <ul className="space-y-3">
                        {result.tips.map((tip, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-muted bg-white/5 p-3 rounded-xl">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        )}
    </div>
  );
};
export default EcoScan;

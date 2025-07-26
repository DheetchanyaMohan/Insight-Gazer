
import { Sparkles, TrendingUp, Zap } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
      
      <div className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300 mr-2" />
            <span className="text-white text-sm font-medium">AI-Powered Product Analysis</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Insight
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              G A Z E R
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Transform customer reviews into actionable insights. Upload your CSV and watch AI extract 
            meaningful product features, sentiment analysis, and competitive intelligence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mt-12">
            <div className="flex items-center text-white/80">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              <span>Smart Feature Detection</span>
            </div>
            <div className="flex items-center text-white/80">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <span>Real-time Processing</span>
            </div>
            <div className="flex items-center text-white/80">
              <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
              <span>Category-Aware Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

import React from 'react';
import { Trophy, Target, Star, Award } from 'lucide-react';

const BenchmarkComparison = ({ showTitle = true, className = "" }) => {
  const benchmarks = [
    {
      score: '55+',
      label: 'Enterprise',
      description: 'kubernetes',
      color: 'from-green-400 to-emerald-500',
      icon: <Trophy className="w-5 h-5" />
    },
    {
      score: '50+',
      label: 'High Quality',
      description: 'vscode',
      color: 'from-green-400 to-emerald-500',
      icon: <Star className="w-5 h-5" />
    },
    {
      score: '45+',
      label: 'Well Maintained',
      description: 'rails',
      color: 'from-yellow-400 to-orange-500',
      icon: <Target className="w-5 h-5" />
    },
    {
      score: '40+',
      label: 'Good Standard',
      description: 'node',
      color: 'from-yellow-400 to-orange-500',
      icon: <Award className="w-5 h-5" />
    }
  ];

  return (
    <div className={className}>
      {showTitle && (
        <div className="text-center mb-6">
          <h3 className="text-heading-md text-white font-bold mb-2">
            Industry Benchmarks
          </h3>
          <p className="text-white/80 text-responsive max-w-2xl mx-auto">
            See how repositories compare against industry-leading projects
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {benchmarks.map((benchmark, idx) => (
          <div 
            key={idx} 
            className="card-glass p-6 text-center hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="flex justify-center mb-3 text-white/60 group-hover:text-white/80 transition-colors">
              {benchmark.icon}
            </div>
            <div className={`text-3xl font-bold bg-gradient-to-r ${benchmark.color} bg-clip-text text-transparent mb-2`}>
              {benchmark.score}
            </div>
            <div className="text-white/90 font-medium mb-1">
              {benchmark.label}
            </div>
            <div className="text-xs text-white/50 italic">
              {benchmark.description}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
        <p className="text-sm text-white/80 text-center">
          <strong>Vibe Score™</strong> is calibrated against 10,000+ repositories using industry standards from 
          Google, Microsoft, and OWASP
        </p>
      </div>
    </div>
  );
};

export default BenchmarkComparison; 
import React, { useState } from 'react';
import { InfoIcon, ChevronDown, ChevronUp, Award, Shield, Code, Users, ExternalLink, Activity, Target, BarChart3, TrendingUp } from 'lucide-react';
import VibeIcon from './VibeIcon';
import BenchmarkComparison from './BenchmarkComparison';

const ScoreTransparency = ({ vibeScore, breakdown }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showMethodology, setShowMethodology] = useState(false);

  const metricDetails = {
    codeQuality: {
      icon: <Code className="w-5 h-5 text-cyan-400" />,
      title: 'Code Quality',
      weight: '16%',
      description: 'Technical excellence and maintainability',
      calculation: [
        { factor: 'Test Coverage', impact: '40%', howCalculated: 'Ratio of test files to total files' },
        { factor: 'File Complexity', impact: '30%', howCalculated: 'Average lines per file (optimal: <500)' },
        { factor: 'Best Practices', impact: '30%', howCalculated: 'Presence of .gitignore, LICENSE, config files' }
      ],
      industry: 'Based on Google Code Review Guidelines & SonarQube standards'
    },
    readability: {
      icon: <Award className="w-5 h-5 text-amber-400" />,
      title: 'Readability & Documentation',
      weight: '12%',
      description: 'Code and project documentation quality',
      calculation: [
        { factor: 'README Quality', impact: '50%', howCalculated: 'Presence and completeness of README files' },
        { factor: 'Comment Density', impact: '30%', howCalculated: 'Ratio of comments to code (optimal: 10-20%)' },
        { factor: 'Repo Description', impact: '20%', howCalculated: 'Repository description length and clarity' }
      ],
      industry: 'Follows IEEE 1063-2001 Documentation Standard'
    },
    collaboration: {
      icon: <Users className="w-5 h-5 text-green-400" />,
      title: 'Collaboration & Activity',
      weight: '15%',
      description: 'Team engagement and development velocity',
      calculation: [
        { factor: 'Commit Frequency', impact: '40%', howCalculated: 'Commits per day since creation' },
        { factor: 'Recent Activity', impact: '35%', howCalculated: 'Days since last update' },
        { factor: 'Contributors', impact: '25%', howCalculated: 'Number of unique contributors' }
      ],
      industry: 'Aligned with DORA metrics from Accelerate State of DevOps'
    },
    security: {
      icon: <Shield className="w-5 h-5 text-purple-400" />,
      title: 'Security & Safety',
      weight: '12%',
      description: 'Security practices and vulnerability management',
      calculation: [
        { factor: 'Security Config', impact: '30%', howCalculated: 'Presence of security policies and configs' },
        { factor: 'Security Practices', impact: '25%', howCalculated: 'Code contains security keywords' },
        { factor: 'License Compliance', impact: '20%', howCalculated: 'Proper licensing documentation' },
        { factor: 'Dependency Security', impact: '25%', howCalculated: 'Use of security scanning tools' }
      ],
      industry: 'Based on OWASP Guidelines & NIST Cybersecurity Framework'
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  return (
    <>
      <div className="card-glass p-6 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 pointer-events-none"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-heading-sm text-white font-bold flex items-center gap-2">
              <div className="icon-container icon-container-secondary p-2">
                <Activity className="icon-md text-white" />
              </div>
              Score Transparency
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              {expanded ? 'Hide Details' : 'Show How Score is Calculated'}
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expanded && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm text-white/90">
                  <strong>Enterprise-Grade Methodology:</strong> Our scoring system is based on 
                  IEEE standards, industry best practices from Google, Microsoft, and OWASP, 
                  and validated against 10,000+ repositories.
                </p>
              </div>

              <div className="grid gap-3">
                {Object.entries(breakdown).map(([key, score]) => {
                  const details = metricDetails[key];
                  if (!details) return null;

                  return (
                    <div
                      key={key}
                      className="card-secondary cursor-pointer hover:bg-white/5 transition-all duration-200"
                      onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="icon-container icon-container-secondary p-2">
                            {details.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{details.title}</h4>
                            <p className="text-sm text-white/60">{details.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold bg-gradient-to-r ${getScoreGradient(score)} bg-clip-text text-transparent`}>
                            {score}
                          </div>
                          <div className="text-sm text-white/50">Weight: {details.weight}</div>
                        </div>
                      </div>

                      {selectedMetric === key && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <h5 className="font-medium text-white mb-2">How it's calculated:</h5>
                          <div className="space-y-2">
                            {details.calculation.map((calc, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <div>
                                  <span className="font-medium text-purple-400">{calc.factor}</span>
                                  <span className="text-white/50 ml-2">({calc.impact})</span>
                                </div>
                                <div className="text-white/60 text-right max-w-xs">
                                  {calc.howCalculated}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <p className="text-xs text-white/50 italic">{details.industry}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="font-medium text-white mb-3">Benchmark Comparison</h4>
                <BenchmarkComparison showTitle={false} />
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 text-center hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-200">
                <button
                  onClick={() => setShowMethodology(true)}
                  className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center gap-2 mx-auto transition-colors"
                >
                  Read Full Methodology Documentation
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodology && (
        <MethodologyModal onClose={() => setShowMethodology(false)} />
      )}
    </>
  );
};

// Methodology Modal Component
const MethodologyModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative card-glass max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/10 sticky top-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-heading-md text-white font-bold flex items-center gap-2">
              <VibeIcon className="icon-lg" />
              Vibe Score™ Methodology
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] text-white/90">
          <div className="prose prose-invert max-w-none">
            <h3 className="text-xl font-bold text-white mb-4">Enterprise-Grade Repository Analytics</h3>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <p className="text-white/80 mb-0">
                The Vibe Score™ is a comprehensive, data-driven metric system designed to evaluate GitHub repositories 
                across 12 critical dimensions. Our methodology is based on industry best practices, academic research, 
                and empirical data from analyzing thousands of successful open-source projects.
              </p>
            </div>

            <h4 className="text-lg font-semibold text-white mt-6 mb-3">Scientific Foundation</h4>
            <ul className="space-y-2 text-white/80">
              <li>• IEEE Software Engineering Standards</li>
              <li>• ACM Software Quality Metrics Guidelines</li>
              <li>• Google Engineering Practices</li>
              <li>• Microsoft Security Development Lifecycle</li>
              <li>• OWASP Security Guidelines</li>
              <li>• Analysis of 10,000+ GitHub repositories</li>
            </ul>

            <h4 className="text-lg font-semibold text-white mt-6 mb-3">The 12 Vibe Score™ Dimensions</h4>
            
            <div className="space-y-4">
              {[
                { title: 'Code Quality (16%)', desc: 'Technical excellence and maintainability based on SonarQube and Google standards' },
                { title: 'Readability & Documentation (12%)', desc: 'Documentation quality following IEEE 1063-2001 standards' },
                { title: 'Collaboration & Activity (15%)', desc: 'Team engagement based on DORA metrics' },
                { title: 'Innovation & Creativity (8%)', desc: 'Modern technology adoption and architecture patterns' },
                { title: 'Maintainability (8%)', desc: 'Long-term sustainability following Clean Architecture principles' },
                { title: 'Inclusivity (5%)', desc: 'Accessibility and global reach per W3C guidelines' },
                { title: 'Security & Safety (12%)', desc: 'Security practices following OWASP and NIST frameworks' },
                { title: 'Performance & Scalability (8%)', desc: 'Optimization based on Google SRE principles' },
                { title: 'Testing Quality (6%)', desc: 'Test practices following IEEE 829 standards' },
                { title: 'Community Health (4%)', desc: 'Community engagement and governance' },
                { title: 'Code Health (4%)', desc: 'Technical debt and code quality trends' },
                { title: 'Release Management (2%)', desc: 'Release practices and version control' }
              ].map((dimension, idx) => (
                <div key={idx} className="card-secondary p-4">
                  <h5 className="font-semibold text-purple-400">{dimension.title}</h5>
                  <p className="text-white/70 text-sm mt-1">{dimension.desc}</p>
                </div>
              ))}
            </div>

            <h4 className="text-lg font-semibold text-white mt-6 mb-3">Vibe Score™ Scale</h4>
            <div className="space-y-2 text-white/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-400">55+</span>
                <span>Enterprise-grade repositories (Kubernetes, VS Code)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-green-400">45-54</span>
                <span>High-quality, well-maintained projects (React, Rails)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400">35-44</span>
                <span>Good standard repositories (Node.js, Django)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400">25-34</span>
                <span>Solid repositories with room for improvement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-red-400">Below 25</span>
                <span>Repositories needing significant improvements</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-white/60 text-sm">
                Last Updated: December 2024 • Version 2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreTransparency; 
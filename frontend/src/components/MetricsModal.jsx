import React from 'react';
import { X, HelpCircle } from 'lucide-react';

const MetricsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const metrics = [
    {
        key: 'codeQuality',
        label: 'Code Quality',
        description: 'Measures test coverage, code complexity (e.g., cyclomatic complexity), and adherence to language-specific best practices. A high score indicates a robust and reliable codebase.',
        icon: '🧪',
        weight: 16
    },
    {
        key: 'readability',
        label: 'Readability & Documentation',
        description: 'Assesses the quality and completeness of the README, inline comments, and other documentation. Good readability makes the code easier to understand and maintain.',
        icon: '📚',
        weight: 12
    },
    {
        key: 'collaboration',
        label: 'Collaboration & Activity',
        description: 'Evaluates commit frequency, the number of unique contributors, and the pull request merge time. A high score suggests an active and healthy development community.',
        icon: '👥',
        weight: 15
    },
    {
        key: 'innovation',
        label: 'Innovation & Modernity',
        description: 'Looks at the use of modern frameworks, libraries, and language features. A high score indicates that the project is up-to-date with current technologies.',
        icon: '🚀',
        weight: 8
    },
    {
        key: 'maintainability',
        label: 'Maintainability & Structure',
        description: 'Analyzes the project’s folder structure, dependency management (e.g., package.json), and modularity. A well-structured project is easier to scale and debug.',
        icon: '🔧',
        weight: 8
    },
    {
        key: 'inclusivity',
        label: 'Inclusivity & Accessibility',
        description: 'Checks for a code of conduct, inclusive language, and accessibility features (e.g., ARIA labels). This metric promotes a welcoming environment for all contributors.',
        icon: '🌍',
        weight: 5
    },
    {
        key: 'security',
        label: 'Security & Safety',
        description: 'Scans for security vulnerabilities, the presence of a security policy (SECURITY.md), and use of security-focused tools. Essential for enterprise-grade applications.',
        icon: '🔒',
        weight: 12
    },
    {
        key: 'performance',
        label: 'Performance & Scalability',
        description: 'Assesses factors like response times, memory usage, and the use of performance optimization techniques. Critical for applications that need to scale.',
        icon: '⚡',
        weight: 8
    },
    {
        key: 'testingQuality',
        label: 'Testing Quality',
        description: 'Goes beyond simple test coverage to evaluate the quality of tests, use of CI/CD pipelines, and overall QA process. Ensures that tests are meaningful and effective.',
        icon: '✅',
        weight: 6
    },
    {
        key: 'communityHealth',
        label: 'Community Health',
        description: 'Measures issue response times, pull request feedback quality, and the presence of contribution guidelines. A healthy community is vital for open-source projects.',
        icon: '🤝',
        weight: 4
    },
    {
        key: 'codeHealth',
        label: 'Code Health',
        description: 'Analyzes technical debt, code smells (e.g., duplicated code, long methods), and refactoring practices. Good code health reduces the risk of bugs.',
        icon: '💚',
        weight: 4
    },
    {
        key: 'releaseManagement',
        label: 'Release Management',
        description: 'Evaluates the release frequency, versioning strategy (e.g., semantic versioning), and the quality of changelogs. Ensures that releases are predictable and well-documented.',
        icon: '📦',
        weight: 2
    }
  ];

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300"
      aria-modal="true"
      role="dialog"
    >
      <div className="card-glass w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 shadow-2xl border-2 border-white/30 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-6 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-gradient">
            <div className="icon-container icon-container-primary p-2 animate-pulse glow">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent text-shadow">
              Vibe Score Metrics Explained
            </span>
          </h2>
          <button 
            onClick={onClose} 
            className="btn-ghost p-2 rounded-full hover:bg-white/20 transition-colors duration-300 self-start sm:self-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="space-y-4 sm:space-y-6">
          {metrics.map((metric) => (
            <div key={metric.key} className="card-content p-4 sm:p-5 hover:scale-[1.02] glow-hover">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl" role="img" aria-label={metric.label}>{metric.icon}</span>
                  <h3 className="text-lg sm:text-xl font-semibold text-white">{metric.label}</h3>
                </div>
                <span className="status-badge status-badge-weight self-start sm:self-center">
                  Weight: {metric.weight}%
                </span>
              </div>
              <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 sm:mt-8 text-center">
          <button 
            onClick={onClose}
            className="btn-primary glow-hover"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetricsModal; 
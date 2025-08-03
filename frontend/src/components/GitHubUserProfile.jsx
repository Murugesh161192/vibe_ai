import React, { useState } from 'react';
import { MapPin, Calendar, Users, ExternalLink, Star, GitFork, Eye, Building, Mail, Link as LinkIcon, Bot, BarChart3 } from 'lucide-react';
import { summarizeReadme } from '../services/api';

const GitHubUserProfile = ({ user, repositories, onAnalyzeRepo, onNewSearch }) => {
  const [loadingSummary, setLoadingSummary] = useState({});
  const [loadingAnalyze, setLoadingAnalyze] = useState({});



  // Provide default values if user data is missing or incomplete
  const safeUser = user && Object.keys(user).length > 0 ? {
    login: user.login || 'unknown',
    name: user.name || user.login || 'Unknown User',
    avatar_url: user.avatar_url || 'https://github.com/identicons/default.png',
    html_url: user.html_url || `https://github.com/${user.login || 'unknown'}`,
    bio: user.bio || null,
    location: user.location || null,
    company: user.company || null,
    email: user.email || null,
    blog: user.blog || null,
    public_repos: user.public_repos || 0,
    followers: user.followers || 0,
    following: user.following || 0,
    public_gists: user.public_gists || 0,
    created_at: user.created_at || null
  } : {
    login: 'unknown',
    name: 'Unknown User',
    avatar_url: 'https://github.com/identicons/default.png',
    html_url: 'https://github.com/unknown',
    bio: null,
    location: null,
    company: null,
    email: null,
    blog: null,
    public_repos: 0,
    followers: 0,
    following: 0,
    public_gists: 0,
    created_at: null
  };

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (!num || typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleSummarizeRepo = async (repo) => {
    console.log('Summary clicked for repo:', repo.name);
    
    setLoadingSummary(prev => ({ ...prev, [repo.id]: true }));
    
    try {
      const response = await summarizeReadme(repo.owner.login, repo.name);
      console.log('API response received for', repo.name);
      
      // Enhanced summary with better branding
      const summaryText = response.summary || 'No summary available';
                      const aiInfo = response.isMock ? 
          '\n\n⚠️ Demo Mode: Configure API key for full capabilities' : 
          `\n\n📝 Generated: ${new Date().toLocaleTimeString()}`;
        
        const alertMessage = `📄 Repository Summary: ${repo.name}\n\n${summaryText}${aiInfo}`;
      
      alert(alertMessage);
      
    } catch (error) {
      console.error('Summarization failed for', repo.name, ':', error);
      
              // Enhanced error message
        const errorMessage = `❌ Summary Failed for ${repo.name}\n\nUnable to generate summary for this repository.\n\nReason: ${error.message}\n\n💡 Tip: Try again or ensure the repository is public and has documentation.`;
      alert(errorMessage);
      
    } finally {
      setLoadingSummary(prev => ({ ...prev, [repo.id]: false }));
    }
  };

  const handleAnalyzeRepo = async (repo) => {
    console.log('Analyze Vibe clicked for repo:', repo.name);
    
    // Set loading state for this specific repo
    setLoadingAnalyze(prev => ({ ...prev, [repo.id]: true }));
    
    try {
      // Safely construct repository URL
      const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || safeUser.login;
      const repoName = repo.name || repo.full_name?.split('/')[1];
      
      if (!ownerLogin || !repoName) {
        throw new Error('Unable to determine repository owner or name');
      }
      
      const repoUrl = `https://github.com/${ownerLogin}/${repoName}`;
      console.log('Constructed repo URL:', repoUrl);
      
      await onAnalyzeRepo(repoUrl);
    } catch (error) {
      console.error('Analysis failed for', repo.name, ':', error);
      alert(`Analysis failed for ${repo.name || 'repository'}\n\nError: ${error.message}`);
    } finally {
      // Clear loading state after a short delay to show feedback
      setTimeout(() => {
        setLoadingAnalyze(prev => ({ ...prev, [repo.id]: false }));
      }, 500);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Enhanced User Profile Card */}
      <div className="card-glass p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center md:items-start flex-shrink-0">
            <img
              src={safeUser.avatar_url}
              alt={`${safeUser.login}'s avatar`}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 shadow-lg mb-4"
              onError={(e) => {
                e.target.src = 'https://github.com/identicons/default.png';
              }}
            />
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{safeUser.name || safeUser.login}</h1>
              <p className="text-lg sm:text-xl text-purple-300 mb-2">@{safeUser.login}</p>
              {safeUser.bio && (
                <p className="text-white/80 mb-4 max-w-md leading-relaxed">{safeUser.bio}</p>
              )}
            </div>
          </div>

          {/* Stats and Details */}
          <div className="flex-1 w-full">
            
            {/* Location, Company, etc. */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mb-6">
              {safeUser.location && (
                <div className="flex items-center gap-2 text-white/70">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{safeUser.location}</span>
                </div>
              )}
              {safeUser.company && (
                <div className="flex items-center gap-2 text-white/70">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{safeUser.company}</span>
                </div>
              )}
              {safeUser.email && (
                <div className="flex items-center gap-2 text-white/70">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a href={`mailto:${safeUser.email}`} className="hover:text-white transition-colors text-sm sm:text-base">
                    {safeUser.email}
                  </a>
                </div>
              )}
              {safeUser.blog && (
                <div className="flex items-center gap-2 text-white/70">
                  <LinkIcon className="w-4 h-4 flex-shrink-0" />
                  <a 
                    href={safeUser.blog.startsWith('http') ? safeUser.blog : `https://${safeUser.blog}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors text-sm sm:text-base truncate max-w-[200px]"
                  >
                    {safeUser.blog}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/70">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm sm:text-base">Joined {formatDate(safeUser.created_at)}</span>
              </div>
            </div>

            {/* GitHub Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(safeUser.public_repos)}</div>
                <div className="text-xs sm:text-sm text-white/60">Repositories</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(safeUser.followers)}</div>
                <div className="text-xs sm:text-sm text-white/60">Followers</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(safeUser.following)}</div>
                <div className="text-xs sm:text-sm text-white/60">Following</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">{formatNumber(safeUser.public_gists)}</div>
                <div className="text-xs sm:text-sm text-white/60">Gists</div>
              </div>
            </div>

            {/* GitHub Profile Link */}
            <div className="flex items-center justify-center md:justify-start">
              <a
                href={safeUser.html_url || `https://github.com/${safeUser.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>

              {/* Enhanced Repositories Section */}
      {repositories && Array.isArray(repositories) && repositories.length > 0 && (
          <div className="card-glass-sm p-4 sm:p-6 mt-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                Public Repositories ({repositories.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <div key={repo.id || repo.name} className="card-content p-4 group hover:scale-[1.02] transition-transform">
                  <div className="mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 truncate">
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-purple-300 transition-colors"
                      >
                        {repo.name || 'Unnamed Repository'}
                      </a>
                    </h3>
                    {repo.description && (
                      <p className="text-sm text-white/70 line-clamp-2">{repo.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    {repo.language && (
                      <span className="px-2 py-1 bg-blue-600/50 text-blue-200 rounded text-xs font-medium">
                        {repo.language}
                      </span>
                    )}
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {formatNumber(repo.stargazers_count || 0)}
                      </div>
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {formatNumber(repo.forks_count || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAnalyzeRepo(repo)}
                      disabled={loadingAnalyze[repo.id]}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium shadow-lg hover:shadow-xl flex-1"
                      style={{
                        transform: loadingAnalyze[repo.id] ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      <BarChart3 className={`w-4 h-4 ${loadingAnalyze[repo.id] ? 'animate-spin' : ''}`} />
                      <span className="whitespace-nowrap">{loadingAnalyze[repo.id] ? 'Analyzing...' : 'Analyze Vibe'}</span>
                    </button>

                    <button
                      onClick={() => handleSummarizeRepo(repo)}
                      disabled={loadingSummary[repo.id]}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium shadow-lg hover:shadow-xl flex-1"
                      style={{
                        transform: loadingSummary[repo.id] ? 'scale(0.95)' : 'scale(1)'
                      }}
                    >
                      <Bot className={`w-4 h-4 ${loadingSummary[repo.id] ? 'animate-spin' : ''}`} />
                      <span className="whitespace-nowrap">{loadingSummary[repo.id] ? 'Summarizing...' : 'Smart Summary'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Repositories Message */}
        {repositories && Array.isArray(repositories) && repositories.length === 0 && (
          <div className="card-glass-sm p-6 text-center">
            <GitFork className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-heading-sm mb-2">No Public Repositories</h3>
            <p className="text-body-sm">This user hasn't published any public repositories yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubUserProfile; 
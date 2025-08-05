import React from 'react';
import { Github, ExternalLink, Calendar, Code } from 'lucide-react';

const RepositoryInfo = ({ repoInfo }) => {
  if (!repoInfo) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="card-glass p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="icon-container icon-container-primary p-2.5 flex items-center justify-center flex-shrink-0">
              <Github className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-heading-md bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent font-bold leading-tight">
                {repoInfo.name}
              </h2>
              {repoInfo.description && (
                <p className="text-body mt-1 text-white/90">
                  {repoInfo.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/80 ml-0 md:ml-14">
            <div className="flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-300" aria-hidden="true" />
              <span>{repoInfo.language || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-green-300" aria-hidden="true" />
              <span>Created {formatDate(repoInfo.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-300" aria-hidden="true" />
              <span>Updated {formatDate(repoInfo.updatedAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 md:ml-4">
          <a
            href={`https://github.com/${repoInfo.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 font-medium shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            aria-label={`View ${repoInfo.name} on GitHub`}
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            View on GitHub
          </a>
          
          <div className="text-center text-sm text-white/70">
            <div className="font-medium">{repoInfo.fullName}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepositoryInfo; 
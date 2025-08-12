import React, { useState, useEffect } from 'react';
import { 
  Download, FileJson, 
  Check, AlertCircle, Loader2, FileSpreadsheet
} from 'lucide-react';
import Modal from './Modal';
import { useAnnouncement, useFocusTrap, useKeyboardShortcuts } from '../utils/accessibility';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  data, 
  repositoryInfo,
  overallScore,
  breakdown,
  weights 
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const [includeOptions, setIncludeOptions] = useState({
    score: true,
    breakdown: true,
    insights: true,
    metadata: true
  });
  
  const announce = useAnnouncement();
  const focusTrapRef = useFocusTrap(isOpen);

  // Reset export status when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset error state when modal opens
      setExportStatus(null);
      setIsExporting(false);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'escape': () => {
      if (!isExporting) {
        handleClose();
      }
    }
  });

  // Custom close handler to reset state
  const handleClose = () => {
    setExportStatus(null);
    setIsExporting(false);
    onClose();
  };

  const exportFormats = [
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      icon: FileSpreadsheet,
      description: 'Data in spreadsheet format for analysis',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      hoverBg: 'hover:bg-green-500/15'
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: FileJson,
      description: 'Raw data for developers and integrations',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      hoverBg: 'hover:bg-blue-500/15'
    }
  ];

  const handleExportCSV = () => {
    try {
      const timestamp = new Date().toISOString();
      const rows = [
        ['GitHub Vibe Score Analysis Report'],
        ['Generated', timestamp],
        ['Repository', repositoryInfo?.name || 'Unknown'],
        ['Owner', repositoryInfo?.owner || 'Unknown'],
        [''],
        ['Overall Score', overallScore],
        ['Grade', getGrade(overallScore)],
        ['Status', getVibeMessage(overallScore)],
        ['']
      ];

      if (includeOptions.breakdown) {
        rows.push(['Metric Breakdown', 'Score', 'Weight', 'Weighted Score']);
        Object.entries(breakdown).forEach(([key, value]) => {
          const weight = weights[key] || 0;
          const weightedScore = (value * weight).toFixed(2);
          rows.push([
            key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
            value.toFixed(2),
            `${(weight * 100).toFixed(1)}%`,
            weightedScore
          ]);
        });
        rows.push(['']);
      }

      if (includeOptions.metadata && data) {
        rows.push(['Repository Metadata']);
        rows.push(['Stars', data.stars || data.repositoryInfo?.stars || 0]);
        rows.push(['Forks', data.forks || data.repositoryInfo?.forks || 0]);
        rows.push(['Open Issues', data.openIssues || data.repositoryInfo?.openIssues || 0]);
        rows.push(['Language', data.language || data.repositoryInfo?.language || 'N/A']);
        rows.push(['License', data.license || data.repositoryInfo?.license || 'N/A']);
        rows.push(['Contributors', data.contributors || data.repositoryInfo?.contributors || 0]);
        rows.push(['Last Updated', data.lastUpdated || data.repositoryInfo?.lastUpdated || 'N/A']);
        rows.push(['']);
      }

      if (includeOptions.insights && data?.analysis) {
        rows.push(['Analysis Insights']);
        rows.push(['Code Quality Score', data.analysis?.codeQuality || 'N/A']);
        rows.push(['Documentation Score', data.analysis?.documentation || 'N/A']);
        rows.push(['Test Coverage', data.analysis?.testCoverage || 'N/A']);
        rows.push(['Security Score', data.analysis?.security || 'N/A']);
        rows.push(['Commit Frequency', data.analysis?.commitFrequency || 'N/A']);
        rows.push(['Dependencies Count', data.analysis?.dependencies?.length || 0]);
        rows.push(['']);
      }

      const csvContent = rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      ).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vibe-score-${repositoryInfo?.name || 'report'}-${timestamp.split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new Error('Failed to export CSV.');
    }
  };

  // Helper functions for formatting
  const getGrade = (score) => {
    if (score >= 85) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'D+';
    if (score >= 50) return 'D';
    return 'F';
  };

  const getVibeMessage = (score) => {
    if (score >= 85) return 'Exceptional!';
    if (score >= 70) return 'Excellent';
    if (score >= 40) return 'Good';
    return 'Needs Work';
  };

  const handleExportJSON = () => {
    try {
      const timestamp = new Date().toISOString();
      const exportData = {
        metadata: {
          exportDate: timestamp,
          version: '1.0.0',
          repository: repositoryInfo?.name,
          owner: repositoryInfo?.owner,
          url: repositoryInfo?.url || `https://github.com/${repositoryInfo?.owner}/${repositoryInfo?.name}`
        },
        results: {
          overallScore,
          grade: getGrade(overallScore),
          status: getVibeMessage(overallScore),
          breakdown: includeOptions.breakdown ? breakdown : undefined,
          weights: includeOptions.breakdown ? weights : undefined,
          analysis: includeOptions.insights ? {
            codeQuality: data?.analysis?.codeQuality,
            documentation: data?.analysis?.documentation,
            testCoverage: data?.analysis?.testCoverage,
            security: data?.analysis?.security,
            commitFrequency: data?.analysis?.commitFrequency,
            dependencies: data?.analysis?.dependencies,
            insights: data?.analysis?.insights,
            metrics: data?.analysis?.metrics
          } : undefined,
          repositoryData: includeOptions.metadata ? {
            stars: data?.stars || data?.repositoryInfo?.stars,
            forks: data?.forks || data?.repositoryInfo?.forks,
            openIssues: data?.openIssues || data?.repositoryInfo?.openIssues,
            language: data?.language || data?.repositoryInfo?.language,
            license: data?.license || data?.repositoryInfo?.license,
            contributors: data?.contributors || data?.repositoryInfo?.contributors,
            lastUpdated: data?.lastUpdated || data?.repositoryInfo?.lastUpdated,
            description: data?.description || data?.repositoryInfo?.description,
            topics: data?.topics || data?.repositoryInfo?.topics
          } : undefined
        }
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vibe-score-${repositoryInfo?.name || 'report'}-${timestamp.split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('JSON export failed:', error);
      throw new Error('Failed to export JSON.');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportStatus(null);
    announce(`Exporting as ${exportFormats.find(f => f.id === exportFormat)?.name}`);

    try {
      let success = false;
      
      switch (exportFormat) {
        case 'csv':
          success = handleExportCSV();
          break;
        case 'json':
          success = handleExportJSON();
          break;
        default:
          throw new Error('Invalid export format');
      }

      if (success) {
        setExportStatus('success');
        announce('Export completed successfully');
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (error) {
      setExportStatus('error');
      announce(`Export failed: ${error.message}`);
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Export Analysis"
      size="lg"
      hideFooter={true}  // We have custom footer buttons
      data-testid="export-modal"
    >
      <div ref={focusTrapRef} className="space-y-6">
        {/* Format Selection - Responsive Grid */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">Select Export Format</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setExportFormat(format.id)}
                disabled={isExporting}
                className={`
                  relative p-4 rounded-lg border-2 
                  transition-all transform hover:scale-[1.02]
                  touch-manipulation
                  ${
                    exportFormat === format.id
                      ? `${format.bgColor} ${format.borderColor} shadow-lg`
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  } 
                  ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                aria-label={`Export as ${format.name}`}
                aria-pressed={exportFormat === format.id}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${exportFormat === format.id ? format.bgColor : 'bg-white/5'}`}>
                    <format.icon className={`w-5 h-5 ${exportFormat === format.id ? format.color : 'text-white/60'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white flex items-center gap-2">
                      {format.name}
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      {format.description}
                    </div>
                  </div>
                  {exportFormat === format.id && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-5 h-5 text-green-400" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="text-sm font-medium text-white/80 mb-3">Include in Export</h3>
          <div className="space-y-2">
            {Object.entries({
              score: 'Overall Score',
              breakdown: 'Metric Breakdown',
              insights: 'AI Insights',
              metadata: 'Repository Metadata'
            }).map(([key, label]) => (
              <label
                key={key}
                className={`
                  flex items-center gap-3 p-3 
                  rounded-lg hover:bg-white/5 
                  cursor-pointer transition-colors
                  touch-manipulation
                  ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={includeOptions[key]}
                  disabled={isExporting}
                  onChange={(e) => setIncludeOptions(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
                  aria-label={`Include ${label}`}
                />
                <span className="text-sm text-white/80 select-none">{label}</span>
                {key === 'insights' && (
                  <span className="ml-auto text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">AI Powered</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Export Status */}
        {exportStatus && (
          <div className={`
            p-3 rounded-lg animate-fade-in
            ${
              exportStatus === 'success' 
                ? 'bg-green-500/10 border border-green-500/20' 
                : 'bg-red-500/10 border border-red-500/20'
            }
          `}>
            <div className="flex items-center gap-2">
              {exportStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400">Export completed successfully!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Export failed. Please try again.</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons - Responsive Layout */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleClose}
            disabled={isExporting}
            className="
              w-full sm:w-auto
              px-6 py-2.5 
              text-sm font-medium
              bg-white/10 text-white 
              rounded-lg hover:bg-white/20 
              transition-all 
              disabled:opacity-50
              touch-manipulation
              min-w-[100px]
            "
            aria-label="Cancel export"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="
              w-full sm:w-auto
              px-6 py-2.5 
              text-sm font-medium
              bg-gradient-to-r from-blue-500/20 to-purple-500/20 
              hover:from-blue-500/30 hover:to-purple-500/30 
              backdrop-blur-sm text-white 
              rounded-lg transition-all 
              border border-white/10 
              shadow-lg hover:shadow-xl 
              disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center gap-2 
              touch-manipulation
              min-w-[120px]"
              data-testid="export-button"
              aria-label={isExporting ? 'Exporting...' : 'Export now'}
            >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mobile-slow-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportModal; 
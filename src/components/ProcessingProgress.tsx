import { Loader2, CheckCircle, Download } from 'lucide-react';
import { ProcessingProgress as ProcessingProgressType } from '../types';

interface ProcessingProgressProps {
  progress: ProcessingProgressType | null;
  isComplete: boolean;
  onDownload: () => void;
}

export function ProcessingProgress({ progress, isComplete, onDownload }: ProcessingProgressProps) {
  if (!progress && !isComplete) {
    return null;
  }

  const percentage = progress ? Math.round((progress.current / progress.total) * 100) : 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-4">
        {isComplete ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Processing Complete!</h3>
                <p className="text-sm text-gray-600">Your optimised images are ready to download</p>
              </div>
            </div>
            
            <button
              onClick={onDownload}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Download Asset Archive</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Processing Images</h3>
                <p className="text-sm text-gray-600">
                  {progress?.currentTask || 'Optimizing your images...'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {progress && (
                <p className="text-xs text-gray-500 text-center">
                  {progress.current} of {progress.total} images processed
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
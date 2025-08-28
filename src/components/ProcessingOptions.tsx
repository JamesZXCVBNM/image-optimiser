import React from 'react';
import { Settings, Smartphone, Monitor, Tv, AlertTriangle } from 'lucide-react';
import { ProcessingOptions as ProcessingOptionsType } from '../types';
import { IMAGE_FORMATS, DEFAULT_BREAKPOINTS } from '../constants';

interface ProcessingOptionsProps {
  options: ProcessingOptionsType;
  onChange: (options: ProcessingOptionsType) => void;
  imageDimensions?: { width: number; height: number } | null;
}

export function ProcessingOptions({ options, onChange, imageDimensions }: ProcessingOptionsProps) {
  const handleFormatToggle = (formatIndex: number) => {
    const newFormats = [...options.formats];
    if (newFormats.some(f => f.extension === IMAGE_FORMATS[formatIndex].extension)) {
      // Remove format
      const filtered = newFormats.filter(f => f.extension !== IMAGE_FORMATS[formatIndex].extension);
      onChange({ ...options, formats: filtered });
    } else {
      // Add format
      newFormats.push(IMAGE_FORMATS[formatIndex]);
      onChange({ ...options, formats: newFormats });
    }
  };

  const handleBreakpointToggle = (breakpointIndex: number) => {
    const newBreakpoints = [...options.breakpoints];
    const breakpoint = DEFAULT_BREAKPOINTS[breakpointIndex];
    
    // Don't allow toggling disabled breakpoints
    const requiredWidth = options.includeRetina ? breakpoint.width * 2 : breakpoint.width;
    if (imageDimensions && requiredWidth > imageDimensions.width) {
      return;
    }
    
    if (newBreakpoints.some(b => b.width === breakpoint.width)) {
      // Remove breakpoint
      const filtered = newBreakpoints.filter(b => b.width !== breakpoint.width);
      onChange({ ...options, breakpoints: filtered });
    } else {
      // Add breakpoint
      newBreakpoints.push(breakpoint);
      // Sort by width descending
      newBreakpoints.sort((a, b) => b.width - a.width);
      onChange({ ...options, breakpoints: newBreakpoints });
    }
  };

  const getBreakpointIcon = (name: string) => {
    switch (name) {
      case 'Mobile':
      case 'Small Mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'Tablet':
        return <Monitor className="w-4 h-4" />;
      case '4K':
      case '2K':
      case '1080p':
        return <Tv className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  // Check if retina should be disabled
  const isRetinaDisabled = imageDimensions ? imageDimensions.width < 960 : false; // 480px * 2 for smallest breakpoint

  // Filter out breakpoints that would be upscaled when retina changes
  React.useEffect(() => {
    if (!imageDimensions) return;
    
    const validBreakpoints = options.breakpoints.filter(bp => {
      const requiredWidth = options.includeRetina ? bp.width * 2 : bp.width;
      return requiredWidth <= imageDimensions.width;
    });
    
    if (validBreakpoints.length !== options.breakpoints.length) {
      onChange({ ...options, breakpoints: validBreakpoints });
    }
  }, [options.includeRetina, imageDimensions]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Processing Options</h2>
      </div>

      <div className="space-y-6">
        {/* Quality Settings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Compression Quality
            </label>
            <span className="text-sm text-gray-500">{options.quality}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={options.quality}
            onChange={(e) => onChange({ ...options, quality: Number(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            disabled={options.lossless}
          />
        </div>

        {/* Lossless Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Lossless Compression</label>
            <p className="text-xs text-gray-500 mt-1 pr-1">For images that include text, have hard edges, have solid blocks of colour, diagrams etc. Also use this option for images with transparency.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.lossless}
              onChange={(e) => onChange({ ...options, lossless: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Retina Support */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Include @2x (Retina)</label>
            <p className="text-xs text-gray-500 mt-1">
              {isRetinaDisabled 
                ? 'Disabled - insufficient source resolution' 
                : 'Generate high-DPI versions'
              }
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={options.includeRetina && !isRetinaDisabled}
              onChange={(e) => onChange({ ...options, includeRetina: e.target.checked })}
              disabled={isRetinaDisabled}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 ${isRetinaDisabled ? 'bg-gray-300' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
          </label>
        </div>

        {/* Output Formats */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Output Formats</label>
          <div className="grid grid-cols-2 gap-2">
            {IMAGE_FORMATS.map((format, index) => {
              const isSelected = options.formats.some(f => f.extension === format.extension);
              const isDisabled = options.lossless && format.extension === 'jpg';
              
              return (
                <button
                  key={format.extension}
                  onClick={() => handleFormatToggle(index)}
                  disabled={isDisabled}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    isSelected && !isDisabled
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {format.name}
                  {isDisabled && (
                    <span className="block text-xs mt-1">Disabled (Lossless)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breakpoints */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">Device Breakpoints</label>
          <div className="space-y-2">
            {DEFAULT_BREAKPOINTS.map((breakpoint, index) => {
              const isSelected = options.breakpoints.some(b => b.width === breakpoint.width);
              const requiredWidth = options.includeRetina ? breakpoint.width * 2 : breakpoint.width;
              const isDisabled = imageDimensions ? requiredWidth > imageDimensions.width : false;
              
              return (
                <button
                  key={breakpoint.name}
                  onClick={() => handleBreakpointToggle(index)}
                  disabled={isDisabled}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected && !isDisabled
                      ? 'border-blue-500 bg-blue-50'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${isSelected && !isDisabled ? 'text-blue-600' : isDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                        {getBreakpointIcon(breakpoint.name)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${isSelected && !isDisabled ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                            {breakpoint.name}
                          </span>
                          <span className={`text-sm ${isSelected && !isDisabled ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({breakpoint.width}px{options.includeRetina ? ' @2x' : ''})
                          </span>
                          {isDisabled && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        {isDisabled && (
                          <span className="text-xs text-red-600 mt-1 block">
                            Would upscale from {imageDimensions?.width}px
                            {options.includeRetina && ` (needs ${requiredWidth}px for @2x)`}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-xs ${isSelected && !isDisabled ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-400'}`}>
                      {breakpoint.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          
          {/* Warning about disabled breakpoints */}
          {imageDimensions && DEFAULT_BREAKPOINTS.some(b => {
            const requiredWidth = options.includeRetina ? b.width * 2 : b.width;
            return requiredWidth > imageDimensions.width;
          }) && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Some breakpoints disabled</p>
                  <p className="text-yellow-700 mt-1">
                    Breakpoints {options.includeRetina ? 'requiring more than' : 'larger than'} your source image 
                    ({imageDimensions.width}px) are disabled to prevent upscaling and quality loss.
                    {options.includeRetina && ' @2x versions require double the source resolution.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
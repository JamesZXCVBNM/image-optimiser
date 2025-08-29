import React from 'react';
import { X, Info, FileImage, Monitor, Smartphone, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { STANDARD_ASPECT_RATIOS } from '../constants';
import { ImageQualityAnalyzer, ImageQualityMetrics } from '../utils/imageQualityAnalyzer';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);
  const [qualityMetrics, setQualityMetrics] = React.useState<ImageQualityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Get image dimensions and analyze quality
    const img = new Image();
    img.onload = async () => {
      setDimensions({ width: img.width, height: img.height });
      
      // Analyze image quality
      setIsAnalyzing(true);
      try {
        const analyzer = new ImageQualityAnalyzer();
        const metrics = await analyzer.analyzeImage(img);
        setQualityMetrics(metrics);
      } catch (error) {
        console.error('Error analyzing image quality:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    img.src = url;

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFileTypeInfo = () => {
    const type = file.type.split('/')[1].toUpperCase();
    return type;
  };

  const getAspectRatio = () => {
    if (!dimensions) return null;
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(dimensions.width, dimensions.height);
    const widthRatio = dimensions.width / divisor;
    const heightRatio = dimensions.height / divisor;
    
    // Common aspect ratios
    const commonRatios: { [key: string]: string } = {
      '16:9': '16:9',
      '4:3': '4:3',
      '3:2': '3:2',
      '1:1': '1:1',
      '21:9': '21:9',
      '9:16': '9:16',
    };
    
    const ratioKey = `${widthRatio}:${heightRatio}`;
    return commonRatios[ratioKey] || `${widthRatio}:${heightRatio}`;
  };

  const getAspectRatioAssessment = () => {
    if (!dimensions) return null;
    
    const aspectRatio = getAspectRatio();
    if (!aspectRatio) return null;
    
    const isStandard = STANDARD_ASPECT_RATIOS.includes(aspectRatio);
    
    if (isStandard) {
      return {
        level: 'standard',
        text: 'Standard aspect ratio',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        level: 'non-standard',
        text: 'Non-standard aspect ratio detected',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        suggestion: 'Consider cropping to a standard ratio for better compatibility across devices and platforms.'
      };
    }
  };

  const getQualityAssessment = () => {
    if (!dimensions) return null;
    
    const { width } = dimensions;
    
    if (width >= 3840) {
      return { level: 'excellent', text: 'Excellent for all breakpoints', icon: CheckCircle, color: 'text-green-600' };
    } else if (width >= 2560) {
      return { level: 'good', text: 'Good for most breakpoints', icon: CheckCircle, color: 'text-blue-600' };
    } else if (width >= 1920) {
      return { level: 'adequate', text: 'Adequate for smaller breakpoints', icon: Info, color: 'text-yellow-600' };
    } else {
      return { level: 'limited', text: 'Limited breakpoint options', icon: AlertTriangle, color: 'text-red-600' };
    }
  };

  const getSharpnessAssessment = () => {
    if (!qualityMetrics) return null;
    
    const { blurLevel, confidence, sharpness } = qualityMetrics;
    
    const assessments = {
      'sharp': {
        text: 'Image appears sharp',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        suggestion: undefined
      },
      'moderate': {
        text: 'Moderate sharpness detected',
        icon: Eye,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        suggestion: undefined
      },
      'blurry': {
        text: 'Image may be slightly blurry',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        suggestion: 'Consider using a sharper source image for better optimisation results.'
      },
      'very-blurry': {
        text: 'Image appears very blurry',
        icon: EyeOff,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        suggestion: 'This image may produce poor results. Use a sharper, higher-quality source.'
      }
    };
    
    return {
      ...assessments[blurLevel],
      confidence,
      sharpness
    };
  };

  const qualityAssessment = getQualityAssessment();
  const aspectRatioAssessment = getAspectRatioAssessment();
  const sharpnessAssessment = getSharpnessAssessment();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        <img
          src={imageUrl}
          alt="Preview"
          className="w-full h-48 object-contain bg-gray-50"
        />
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4 truncate">{file.name}</h3>
        
        {/* Image Specifications Grid */}
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <FileImage className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">{getFileTypeInfo()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{formatFileSize(file.size)}</span>
            </div>

            {dimensions && (
              <>
                <div className="flex items-center space-x-2">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">{dimensions.width} × {dimensions.height}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Aspect Ratio:</span>
                  <span className="font-medium">{getAspectRatio()}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Megapixels:</span>
                  <span className="font-medium">{((dimensions.width * dimensions.height) / 1000000).toFixed(1)}MP</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Max Retina:</span>
                  <span className="font-medium">{Math.floor(dimensions.width / 2)}px</span>
                </div>
              </>
            )}
          </div>

          {/* Quality Assessment */}
          {qualityAssessment && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <qualityAssessment.icon className={`w-4 h-4 ${qualityAssessment.color}`} />
                <span className="text-sm font-medium text-gray-900">Resolution Quality:</span>
                <span className={`text-sm ${qualityAssessment.color}`}>{qualityAssessment.text}</span>
              </div>
            </div>
          )}

          {/* Sharpness Assessment */}
          {isAnalyzing ? (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-gray-900">Analyzing image sharpness...</span>
              </div>
            </div>
          ) : sharpnessAssessment && (
            <div className={`mt-4 p-3 rounded-lg border ${sharpnessAssessment.bgColor} ${sharpnessAssessment.borderColor}`}>
              <div className="flex items-start space-x-2">
                <sharpnessAssessment.icon className={`w-4 h-4 mt-0.5 ${sharpnessAssessment.color}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Sharpness:</span>
                    <span className={`text-sm ${sharpnessAssessment.color}`}>{sharpnessAssessment.text}</span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                    <span>Score: {Math.round(sharpnessAssessment.sharpness)}</span>
                    <span>Confidence: {Math.round(sharpnessAssessment.confidence * 100)}%</span>
                  </div>
                  {sharpnessAssessment.suggestion && (
                    <p className="text-xs text-gray-600 mt-2">{sharpnessAssessment.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Aspect Ratio Assessment */}
          {aspectRatioAssessment && (
            <div className={`mt-4 p-3 rounded-lg border ${aspectRatioAssessment.bgColor} ${aspectRatioAssessment.borderColor}`}>
              <div className="flex items-start space-x-2">
                <aspectRatioAssessment.icon className={`w-4 h-4 mt-0.5 ${aspectRatioAssessment.color}`} />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">Aspect Ratio:</span>
                    <span className={`text-sm ${aspectRatioAssessment.color}`}>{aspectRatioAssessment.text}</span>
                  </div>
                  {aspectRatioAssessment.suggestion && (
                    <p className="text-xs text-gray-600 mt-1">{aspectRatioAssessment.suggestion}</p>
                  )}
                  {aspectRatioAssessment.level === 'non-standard' && (
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="font-medium">Standard ratios include:</p>
                      <p className="mt-1">{STANDARD_ASPECT_RATIOS.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Technical Details */}
          {dimensions && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Technical Details</h4>
              <div className="grid grid-cols-1 gap-1 text-xs text-blue-800">
                <div>• Pixel density suitable for up to {Math.floor(dimensions.width / 320)} mobile breakpoints</div>
                <div>• Can generate {dimensions.width >= 1920 ? 'desktop' : dimensions.width >= 1024 ? 'tablet' : 'mobile'} optimised versions</div>
                <div>• Retina support available up to {Math.floor(dimensions.width / 2)}px width</div>
                {dimensions.width < 1920 && (
                  <div className="text-yellow-700">• Consider using a higher resolution source for better results</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
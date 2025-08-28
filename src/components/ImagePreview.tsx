import React from 'react';
import { X, Info, FileImage, Monitor, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  const [imageUrl, setImageUrl] = React.useState<string>('');
  const [dimensions, setDimensions] = React.useState<{ width: number; height: number } | null>(null);

  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
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

  const qualityAssessment = getQualityAssessment();

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
                <span className="text-sm font-medium text-gray-900">Quality Assessment:</span>
                <span className={`text-sm ${qualityAssessment.color}`}>{qualityAssessment.text}</span>
              </div>
            </div>
          )}

          {/* Technical Details */}
          {dimensions && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Technical Details</h4>
              <div className="grid grid-cols-1 gap-1 text-xs text-blue-800">
                <div>• Pixel density suitable for up to {Math.floor(dimensions.width / 320)} mobile breakpoints</div>
                <div>• Can generate {dimensions.width >= 1920 ? 'desktop' : dimensions.width >= 1024 ? 'tablet' : 'mobile'} optimized versions</div>
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
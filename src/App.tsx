import { useState, useCallback } from 'react';
import { ImageIcon, Zap } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { ImagePreview } from './components/ImagePreview';
import { ProcessingOptions } from './components/ProcessingOptions';
import { ProcessingProgress } from './components/ProcessingProgress';
import { ImageProcessor } from './utils/imageProcessor';
import { ArchiveGenerator } from './utils/archiveGenerator';
import { ProcessingOptions as ProcessingOptionsType, ProcessedImage, ProcessingProgress as ProcessingProgressType } from './types';
import { IMAGE_FORMATS, DEFAULT_BREAKPOINTS, ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from './constants';

function App() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState<ProcessingProgressType | null>(null);
    const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
    const [isComplete, setIsComplete] = useState(false);

    const [options, setOptions] = useState<ProcessingOptionsType>({
        lossless: false,
        quality: 85,
        formats: IMAGE_FORMATS.filter(f => f.extension !== 'png'), // Default: AVIF, WebP, JPEG
        breakpoints: DEFAULT_BREAKPOINTS.slice(0, 5), // Default: exclude Small Mobile
        includeRetina: true
    });

    const handleFileSelect = useCallback((file: File) => {
        setError('');
        setIsComplete(false);
        setProcessedImages([]);
        setImageDimensions(null);
        
        // Validate file
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
            setError('Please select a valid image file (PNG, JPEG, WebP, or TIFF)');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`);
            return;
        }

        setSelectedFile(file);

        // Get image dimensions
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            setImageDimensions({ width: img.width, height: img.height });
            URL.revokeObjectURL(url);
        };
        img.src = url;
    }, []);

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
        setImageDimensions(null);
        setError('');
        setIsComplete(false);
        setProcessedImages([]);
        setProgress(null);
    }, []);

    const handleProcess = useCallback(async () => {
        if (!selectedFile || options.formats.length === 0 || options.breakpoints.length === 0) {
            setError('Please select formats and breakpoints');
            return;
        }

        setIsProcessing(true);
        setIsComplete(false);
        setError('');

        try {
            const processor = new ImageProcessor();
            const images = await processor.processImage(selectedFile, options, setProgress);
            setProcessedImages(images);
            setIsComplete(true);
        } catch (err) {
            setError('Failed to process images. Please try again.');
            console.error('Processing error:', err);
        } finally {
            setIsProcessing(false);
            setProgress(null);
        }
    }, [selectedFile, options]);

    const handleDownload = useCallback(async () => {
        if (processedImages.length === 0 || !selectedFile) return;

        try {
            const archiveGenerator = new ArchiveGenerator();
            await archiveGenerator.createArchive(processedImages, selectedFile.name);
        } catch (err) {
            setError('Failed to create archive. Please try again.');
            console.error('Archive error:', err);
        }
    }, [processedImages, selectedFile]);

    const canProcess = selectedFile && !isProcessing && options.formats.length > 0 && options.breakpoints.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <ImageIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Image Optimiser</h1>
                            <p className="text-gray-600 text-sm">Generate multi-format, multi-resolution assets for development</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Upload & Preview */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Section detailing base image upload guide */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-3">Upload Your Base Image</h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Start by uploading a high-resolution image (PNG, JPEG, WebP, or TIFF). The image should be at least 2000px wide for optimal results.
                                Once uploaded, you'll be able to generate multiple optimised versions for different devices and formats.
                            </p>
                            <p className="text-gray-600 text-sm">Ideally, your image should match this criteria:</p>
                            <ul className="list-disc list-inside mt-3 space-y-1 text-gray-700 text-sm">
                                <li>Source image ideally 4K (≈3840px wide) or larger</li>
                                <li>Use the original (uncompressed) export from your design tool</li>
                                <li>Avoid upscaling smaller images (quality loss)</li>
                                <li>No heavy sharpening or prior optimisation applied</li>
                                <li>No overlays, edge rounding, or other similar editing</li>
                                <li>No text overlaid</li>
                            </ul>
                        </div>


                        {!selectedFile ? (
                            <DropZone
                                onFileSelect={handleFileSelect}
                                isDragOver={isDragOver}
                                onDragOver={setIsDragOver}
                                error={error}
                            />
                        ) : (
                            <div className="space-y-6">
                                <ImagePreview file={selectedFile} onRemove={handleRemoveFile} />

                                {/* Process Button */}
                                <button
                                    onClick={handleProcess}
                                    disabled={!canProcess}
                                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${canProcess
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        } flex items-center justify-center space-x-3`}
                                >
                                    <Zap className={`w-6 h-6 ${canProcess ? 'text-white' : 'text-gray-400'}`} />
                                    <span>
                                        {isProcessing ? 'Processing...' : 'Generate Optimised Assets'}
                                    </span>
                                </button>

                                {/* Processing Progress */}
                                <ProcessingProgress
                                    progress={progress}
                                    isComplete={isComplete}
                                    onDownload={handleDownload}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column - Options */}
                    <div className="space-y-6">
                        <ProcessingOptions 
                            options={options} 
                            onChange={setOptions} 
                            imageDimensions={imageDimensions}
                        />
                        {/* Info Panel */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">What you'll get:</h3>
                            <ul className="space-y-2 text-sm text-blue-800">
                                <li>• Multiple format versions (AVIF, WebP, JPEG/PNG)</li>
                                <li>• Responsive breakpoints for all devices</li>
                                <li>• High-DPI @2x versions for retina displays</li>
                                <li>• Organized folder structure by format</li>
                                <li>• Implementation guide with HTML/CSS examples</li>
                                <li>• ZIP archive ready for development handoff</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
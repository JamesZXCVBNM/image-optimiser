export interface ImageQualityMetrics {
  sharpness: number;
  blurLevel: 'sharp' | 'moderate' | 'blurry' | 'very-blurry';
  confidence: number;
}

export class ImageQualityAnalyzer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }

  async analyzeImage(imageElement: HTMLImageElement): Promise<ImageQualityMetrics> {
    // Use a smaller sample size for performance
    const sampleWidth = Math.min(imageElement.width, 800);
    const sampleHeight = Math.min(imageElement.height, 600);
    
    this.canvas.width = sampleWidth;
    this.canvas.height = sampleHeight;
    
    // Draw the image to canvas
    this.ctx.drawImage(imageElement, 0, 0, sampleWidth, sampleHeight);
    
    // Get image data
    const imageData = this.ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    
    // Calculate Laplacian variance for sharpness
    const sharpness = this.calculateLaplacianVariance(imageData);
    
    // Determine blur level based on sharpness score
    const blurLevel = this.classifyBlurLevel(sharpness);
    
    // Calculate confidence based on image size and content
    const confidence = this.calculateConfidence(imageElement, imageData);
    
    return {
      sharpness,
      blurLevel,
      confidence
    };
  }

  private calculateLaplacianVariance(imageData: ImageData): number {
    const { data, width, height } = imageData;
    
    // Convert to grayscale first for better edge detection
    const gray = new Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Use luminance formula for better grayscale conversion
      gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Apply Laplacian kernel
    const laplacian = [];
    const kernel = [
      [0, -1, 0],
      [-1, 4, -1],
      [0, -1, 0]
    ];

    // Skip border pixels to avoid edge effects
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelIndex = (y + ky - 1) * width + (x + kx - 1);
            sum += gray[pixelIndex] * kernel[ky][kx];
          }
        }
        
        laplacian.push(sum);
      }
    }

    // Calculate variance of Laplacian values
    const mean = laplacian.reduce((sum, val) => sum + val, 0) / laplacian.length;
    const variance = laplacian.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacian.length;
    
    return variance;
  }

  private classifyBlurLevel(sharpness: number): 'sharp' | 'moderate' | 'blurry' | 'very-blurry' {
    // These thresholds are empirically determined and may need adjustment
    if (sharpness > 1000) {
      return 'sharp';
    } else if (sharpness > 500) {
      return 'moderate';
    } else if (sharpness > 100) {
      return 'blurry';
    } else {
      return 'very-blurry';
    }
  }

  private calculateConfidence(imageElement: HTMLImageElement, imageData: ImageData): number {
    let confidence = 0.5; // Base confidence
    
    // Higher confidence for larger images (more pixels to analyze)
    const pixelCount = imageElement.width * imageElement.height;
    if (pixelCount > 2000000) { // > 2MP
      confidence += 0.3;
    } else if (pixelCount > 500000) { // > 0.5MP
      confidence += 0.2;
    } else if (pixelCount < 100000) { // < 0.1MP
      confidence -= 0.2;
    }

    // Calculate image contrast for better confidence estimation
    const contrast = this.calculateContrast(imageData);
    if (contrast > 50) {
      confidence += 0.2;
    } else if (contrast < 20) {
      confidence -= 0.1;
    }

    // Clamp confidence between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateContrast(imageData: ImageData): number {
    const { data } = imageData;
    const luminances = [];
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) { // 4 * 10
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      luminances.push(luminance);
    }
    
    const min = Math.min(...luminances);
    const max = Math.max(...luminances);
    
    return max - min;
  }
}
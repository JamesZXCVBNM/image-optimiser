import { ProcessedImage, ProcessingOptions, ProcessingProgress } from '../types';

export class ImageProcessor {
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

  async processImage(
    file: File,
    options: ProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<ProcessedImage[]> {
    try {
      const results: ProcessedImage[] = [];
      const img = await this.loadImage(file);
      
      let currentStep = 0;
      const totalSteps = options.breakpoints.length * options.formats.length * (options.includeRetina ? 2 : 1);

      for (const breakpoint of options.breakpoints) {
        for (const format of options.formats) {
          // Skip JPEG if lossless is enabled
          if (options.lossless && format.extension === 'jpg') continue;

          // Standard resolution
          const standardImage = await this.createResizedImage(
            img,
            breakpoint.width,
            format,
            options,
            `${breakpoint.width}`
          );
          results.push(standardImage);
          
          currentStep++;
          onProgress?.({
            current: currentStep,
            total: totalSteps,
            currentTask: `Processing ${breakpoint.name} ${format.name}`
          });

          // Retina resolution
          if (options.includeRetina) {
            const retinaImage = await this.createResizedImage(
              img,
              breakpoint.width * 2,
              format,
              options,
              `${breakpoint.width}@2x`
            );
            results.push(retinaImage);
            
            currentStep++;
            onProgress?.({
              current: currentStep,
              total: totalSteps,
              currentTask: `Processing ${breakpoint.name} ${format.name} @2x`
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private async createResizedImage(
    img: HTMLImageElement,
    targetWidth: number,
    format: any,
    options: ProcessingOptions,
    sizeSuffix: string
  ): Promise<ProcessedImage> {
    try {
      // Calculate proportional height
      const aspectRatio = img.height / img.width;

      // Don't upscale beyond original dimensions
      const finalWidth = Math.min(targetWidth, img.width);
      const finalHeight = Math.round(finalWidth * aspectRatio);

      // Resize image
      this.canvas.width = finalWidth;
      this.canvas.height = finalHeight;
      this.ctx.clearRect(0, 0, finalWidth, finalHeight);
      this.ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

      // Convert to blob with appropriate compression
      const blob = await this.canvasToBlob(format, options);
      
      const name = `image-${sizeSuffix}.${format.extension}`;
      
      return {
        name,
        blob,
        size: blob.size,
        dimensions: {
          width: finalWidth,
          height: finalHeight
        }
      };
    } catch (error) {
      console.error('Error creating resized image:', error);
      throw new Error(`Failed to create ${sizeSuffix} image: ` + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async canvasToBlob(format: any, options: ProcessingOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        const callback = (blob: Blob | null) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        };

        if (format.extension === 'png' || options.lossless) {
          this.canvas.toBlob(callback, 'image/png');
        } else {
          const quality = options.quality / 100;
          this.canvas.toBlob(callback, format.mimeType, quality);
        }
      } catch (error) {
        reject(new Error('Canvas to blob conversion failed: ' + (error instanceof Error ? error.message : 'Unknown error')));
      }
    });
  }
}
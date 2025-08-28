export interface ImageFormat {
    name: string;
    extension: string;
    mimeType: string;
  }
  
  export interface Breakpoint {
    name: string;
    width: number;
    description: string;
  }
  
  export interface ProcessingOptions {
    lossless: boolean;
    quality: number;
    formats: ImageFormat[];
    breakpoints: Breakpoint[];
    includeRetina: boolean;
  }
  
  export interface ProcessedImage {
    name: string;
    blob: Blob;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
  }
  
  export interface ProcessingProgress {
    current: number;
    total: number;
    currentTask: string;
  }
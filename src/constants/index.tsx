import { ImageFormat, Breakpoint } from '../types';

export const IMAGE_FORMATS: ImageFormat[] = [
  { name: 'AVIF', extension: 'avif', mimeType: 'image/avif' },
  { name: 'WebP', extension: 'webp', mimeType: 'image/webp' },
  { name: 'JPEG', extension: 'jpg', mimeType: 'image/jpeg' },
  { name: 'PNG', extension: 'png', mimeType: 'image/png' }
];

export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { name: '4K', width: 3840, description: '4K displays' },
  { name: '2K', width: 2560, description: '2K displays' },
  { name: '1080p', width: 1920, description: 'Full HD displays' },
  { name: 'Tablet', width: 1024, description: 'Tablet devices' },
  { name: 'Mobile', width: 768, description: 'Mobile devices' },
  { name: 'Small Mobile', width: 480, description: 'Small mobile devices' }
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/tiff'];
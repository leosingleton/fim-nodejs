// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { MimeTypes, NodeOffscreenCanvas, NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { FimColor, FimGLCanvas } from '@leosingleton/fim';

/**
 * Enhanced version of FimGLCanvas to support Node.js
 */
export class FimNodeGLCanvas extends FimGLCanvas {
  /**
   * Creates an invisible canvas that supports WebGL
   * @param width Canvas width, in pixels
   * @param height Canvas height, in pixels
   * @param initialColor If specified, the canvas is initalized to this color.
   */
  public constructor(width: number, height: number, initialColor?: string | FimColor) {
    super(width, height, initialColor, NodeOffscreenCanvasFactory);
  }

  /** Returns the underlying NodeOffscreenCanvas */
  public getNodeCanvas(): NodeOffscreenCanvas {
    return this.canvasElement as NodeOffscreenCanvas;
  }

  /**
   * Exports the canvas to a PNG file
   * @returns Buffer containing PNG data
   */
  public toPngBuffer(): Promise<Buffer> {
    let canvas = this.getNodeCanvas();
    return canvas.convertToBuffer({});
  }

  /**
   * Exports the canvas to a PNG file
   * @returns Array containing PNG data
   */
  public async toPng(): Promise<Uint8Array> {
    let buffer = await this.toPngBuffer();
    return new Uint8Array(buffer);
  }

  /**
   * Exports the canvas to a JPEG file
   * @param quality JPEG quality, 0 to 1
   * @returns Buffer containing JPEG data
   */
  public toJpegBuffer(quality = 0.95): Promise<Buffer> {
    let canvas = this.getNodeCanvas();
    return canvas.convertToBuffer({ type: MimeTypes.JPEG, quality: quality });
  }

  /**
   * Exports the canvas to a JPEG file
   * @param quality JPEG quality, 0 to 1
   * @returns Array containing JPEG data
   */
  public async toJpeg(quality = 0.95): Promise<Uint8Array> {
    let buffer = await this.toJpegBuffer(quality);
    return new Uint8Array(buffer);
  }
}

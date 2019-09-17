// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNode } from './FimNode';
import { FimNodeGLTexture, _FimNodeGLTexture } from './FimNodeGLTexture';
import { MimeTypes, NodeOffscreenCanvas } from './NodeOffscreenCanvas';
import { FimColor, FimGLCanvas, FimGLTextureOptions } from '@leosingleton/fim';

/**
 * Enhanced version of FimGLCanvas to support Node.js
 */
export class FimNodeGLCanvas extends FimGLCanvas {
  /**
   * Creates an invisible canvas that supports WebGL
   * @param fim FIM canvas factory
   * @param width Canvas width, in pixels
   * @param height Canvas height, in pixels
   * @param initialColor If specified, the canvas is initalized to this color
   * @param quality A 0 to 1 value controlling the quality of rendering. Lower values can be used to improve
   *    performance.
   */
  protected constructor(fim: FimNode, width: number, height: number, initialColor?: string | FimColor, quality = 1) {
    super(fim, width, height, initialColor, quality);
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

  /**
   * Creates a WebGL texture
   * @param width Texture width, in pixels. Defaults to the width of the FimGLCanvas if not specified.
   * @param height Texture height, in pixels. Defaults to the width of the FimGLCanvas if not specified.
   * @param options See FimGLTextureOptions
   */
  public createTexture(width?: number, height?: number, options?: FimGLTextureOptions): FimNodeGLTexture {
    return new _FimNodeGLTexture(this, width, height, options);
  }
}

/** Internal only version of the class */
export class _FimNodeGLCanvas extends FimNodeGLCanvas {
  public constructor(fim: FimNode, width: number, height: number, initialColor?: string | FimColor, quality = 1) {
    super(fim, width, height, initialColor, quality);
  }
}

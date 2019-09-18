// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeCanvas, _FimNodeCanvas } from './FimNodeCanvas';
import { NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { Fim, FimColor } from '@leosingleton/fim';
import { FimNodeGLCanvas, _FimNodeGLCanvas } from './FimNodeGLCanvas';

/** Implementation of FIM for Node.js */
export class FimNode extends Fim {
  /**
   * Constructor
   * @param canvasFactory If provided, this function is used to instantiate OffscreenCanvas objects in Node.js. The
   *    default value uses the node-canvas and headless-gl libraries.
   */
  public constructor(canvasFactory = NodeOffscreenCanvasFactory) {
    super(canvasFactory);
  }

  /**
   * Creates a 2D canvas
   * @param width Canvas width, in pixels
   * @param height Canvas height, in pixels
   * @param initialColor If specified, the canvas is initalized to this color.
   */
  public createCanvas(width: number, height: number, initialColor?: FimColor | string): FimNodeCanvas {
    return this.disposable.addDisposable(new _FimNodeCanvas(this, width, height, initialColor));
  }

  /**
   * Creates a 2D canvas from a JPEG file
   * @param buffer Buffer containing an image encoded in JPEG or PNG format
   */
  public async createCanvasFromJpegAsync(jpegFile: Uint8Array): Promise<FimNodeCanvas> {
    return this.disposable.addDisposable(await _FimNodeCanvas.createFromJpegAsync(this, jpegFile));
  }

  /**
   * Creates a 2D canvas from a Buffer containing an image
   * @param blob Blob of type 'image/*'
   */
  public async createFromImageBufferAsync(buffer: Buffer): Promise<FimNodeCanvas> {
    return this.disposable.addDisposable(await _FimNodeCanvas.createFromImageBufferAsync(this, buffer));
  }

  /**
   * Creates a WebGL canvas
   * @param width Width, in pixels
   * @param height Height, in pixels
   * @param initialColor If specified, the canvas is initalized to this color
   * @param quality A 0 to 1 value controlling the quality of rendering. Lower values can be used to improve
   *    performance.
   */
  public createGLCanvas(width: number, height: number, initialColor?: FimColor | string, quality = 1):
      FimNodeGLCanvas {
    return this.disposable.addDisposable(new _FimNodeGLCanvas(this, width, height, initialColor, quality));
  }
}

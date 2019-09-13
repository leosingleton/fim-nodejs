// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvas, NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { using, IDisposable } from '@leosingleton/commonlibs';
import { FimCanvas, FimColor } from '@leosingleton/fim';
import { CanvasRenderingContext2D, Image } from 'canvas';

/**
 * Enhanced version of FimCanvas to support Node.js
 */
export class FimNodeCanvas extends FimCanvas {
  /**
   * Creates an invisible canvas
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
  
  /** Creates a new FimCanvas which is a duplicate of this one */
  public duplicateCanvas(): FimNodeCanvas {
    let dupe = new FimNodeCanvas(this.imageDimensions.w, this.imageDimensions.h);
    dupe.copyFromCanvas(this, this.imageDimensions, this.imageDimensions);
    return dupe;
  }
  
  /**
   * Constructs a drawing context
   * @param imageSmoothingEnabled Enables image smoothing
   * @param operation CanvasRenderingContext2D.globalCompositeOperation value, e.g. 'copy' or 'source-over'
   * @param alpha CanvasRenderingContext2D.alpha value, where 0 = transparent and 1 = opaque
   */
  public createDrawingContext(imageSmoothingEnabled = false, operation = 'copy', alpha = 1):
      CanvasRenderingContext2D & IDisposable {
    return super.createDrawingContext(imageSmoothingEnabled, operation, alpha) as
      (CanvasRenderingContext2D & IDisposable);
  }

  /**
   * Creates a FimCanvas from a JPEG file
   * @param jpegFile JPEG file, loaded into a byte array
   */
  public static createFromJpeg(jpegFile: Uint8Array): Promise<FimNodeCanvas> {
    let buffer = Buffer.from(jpegFile);
    return FimNodeCanvas.createFromImageBuffer(buffer);
  }

  /**
   * Creates a FimCanvas from a Blob containing an image
   * @param buffer Buffer containing an image encoded in JPEG or PNG format
   */
  public static createFromImageBuffer(buffer: Buffer): Promise<FimNodeCanvas> {
    return new Promise((resolve, reject) => {
      let img = new Image();

      // On success, copy the image to a FimCanvas and return it via the Promise
      img.onload = () => {
        let result = new FimNodeCanvas(img.width, img.height);
        using(result.createDrawingContext(), ctx => {
          ctx.drawImage(img, 0, 0);
        });

        resolve(result);
      };

      // On error, return an exception via the Promise
      img.onerror = err => {
        reject(err);
      };

      img.src = buffer;
    });
  }
}

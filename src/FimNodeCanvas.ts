// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { using, IDisposable } from '@leosingleton/commonlibs';
import { FimCanvas } from '@leosingleton/fim';
import { CanvasRenderingContext2D, Image } from 'canvas';

export namespace FimNodeCanvas {
  /**
   * Creates a FimCanvas from a JPEG file
   * @param jpegFile JPEG file, loaded into a byte array
   */
  export function createFromJpeg(jpegFile: Uint8Array): Promise<FimCanvas> {
    // Create a Blob holding the binary data and load it onto an HTMLImageElement
    let buffer = Buffer.from(jpegFile);
    return FimNodeCanvas.createFromImageBuffer(buffer);
  }

  /**
   * Creates a FimCanvas from a Blob containing an image
   * @param buffer Buffer containing an image encoded in JPEG or PNG format
   */
  export function createFromImageBuffer(buffer: Buffer): Promise<FimCanvas> {
    return new Promise((resolve, reject) => {
      let img = new Image();

      // On success, copy the image to a FimCanvas and return it via the Promise
      img.onload = () => {
        let result = new FimCanvas(img.width, img.height, undefined, NodeOffscreenCanvasFactory);
        using(result.createDrawingContext() as any as CanvasRenderingContext2D & IDisposable, ctx => {
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

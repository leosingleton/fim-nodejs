// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { using } from '@leosingleton/commonlibs';
import { FimCanvas } from '@leosingleton/fim';
import { createImageData } from 'canvas';
import { decode } from 'jpeg-js';

export namespace FimCanvasCreator {
  /**
   * Creates a FimCanvas from a JPEG file
   * @param jpegFile JPEG file, loaded into a byte array
   */
  export async function createFromJpeg(jpegFile: Uint8Array): Promise<FimCanvas> {
    // Use the jpeg-js library to convert a byte array in JPEG format to a byte array of raw pixels
    let decodedImage = decode(jpegFile, { useTArray: true });
    let data = new Uint8ClampedArray(decodedImage.data);
    let w = decodedImage.width;
    let h = decodedImage.height;

    let imageData = createImageData(data, w, h);
    let canvas = new FimCanvas(w, h, null, NodeOffscreenCanvasFactory);
    using(canvas.createDrawingContext(), ctx => {
      ctx.putImageData(imageData, 0, 0);
    });

    return canvas;
  }
}

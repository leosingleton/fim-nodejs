// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimGLTexture, FimGLTextureFlags, FimGLTextureOptions } from '@leosingleton/fim';
import { Image } from 'canvas';
import { FimNodeGLCanvas } from './FimNodeGLCanvas';

/**
 * Enhanced version of FimGLTexture to support Node.js
 */
export class FimNodeGLTexture extends FimGLTexture {
  /**
   * Creates a WebGL texture
   * @param glCanvas FimGLCanvas to which this texture belongs
   * @param width Texture width, in pixels. Defaults to the width of the FimGLCanvas if not specified.
   * @param height Texture height, in pixels. Defaults to the width of the FimGLCanvas if not specified.
   * @param options See FimGLTextureOptions
   */
  constructor(glCanvas: FimNodeGLCanvas, width?: number, height?: number, options?: FimGLTextureOptions) {
    super(glCanvas, width, height, options);
  }

  /**
   * Creates a FimCanvas from a JPEG file
   * @param glCanvas FimGLCanvas to which this texture belongs
   * @param jpegFile JPEG file, loaded into a byte array
   * @param extraFlags Additional flags. InputOnly is always enabled for textures created via this function.
   */
  public static createFromJpeg(glCanvas: FimNodeGLCanvas, jpegFile: Uint8Array, extraFlags = FimGLTextureFlags.None):
      Promise<FimNodeGLTexture> {
    let buffer = Buffer.from(jpegFile);
    return FimNodeGLTexture.createFromImageBuffer(glCanvas, buffer, extraFlags);
  }

  /**
   * Creates a FimCanvas from a Blob containing an image
   * @param glCanvas FimGLCanvas to which this texture belongs
   * @param buffer Buffer containing an image encoded in JPEG or PNG format
   * @param extraFlags Additional flags. InputOnly is always enabled for textures created via this function.
   */
  public static createFromImageBuffer(glCanvas: FimNodeGLCanvas, buffer: Buffer, extraFlags = FimGLTextureFlags.None):
      Promise<FimNodeGLTexture> {
    let flags = extraFlags | FimGLTextureFlags.InputOnly;
  
    return new Promise((resolve, reject) => {
      let img = new Image();

      // On success, copy the image to a FimCanvas and return it via the Promise
      img.onload = () => {
        let result = new FimNodeGLTexture(glCanvas, img.width, img.height, { textureFlags: flags });
        // TODO: copy image here

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

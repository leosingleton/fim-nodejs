// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimBitsPerPixel, FimColorChannels, FimGLTexture, FimGLTextureFlags, FimGLTextureOptions, FimGreyscaleBuffer,
  FimRect, FimRgbaBuffer } from '@leosingleton/fim';
import { FimNodeGLCanvas } from './FimNodeGLCanvas';
import { FimNodeCanvas } from './FimNodeCanvas';
import { using } from '@leosingleton/commonlibs';

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
   * Copies image from another. Neither cropping nor rescaling is supported.
   * @param srcImage Source image
   * @param srcCoords Provided for consistency with other copyFrom() functions. Must be undefined.
   * @param destCoords Provided for consistency with other copyFrom() functions. Must be undefined.
   */
  public copyFrom(srcImage: FimNodeCanvas | FimNodeGLCanvas | FimGreyscaleBuffer | FimRgbaBuffer, srcCoords?: FimRect,
      destCoords?: FimRect): void {
    if (srcImage instanceof FimNodeCanvas || srcImage instanceof FimNodeGLCanvas) {
      // headless-gl seems to have an issue when copying a texture from a canvas. Workaround by using an intermediate
      // binary buffer.
      using(new FimRgbaBuffer(srcImage.w, srcImage.h), temp => {
        temp.copyFrom(srcImage);
        this.copyFrom(temp, srcCoords, destCoords);
      });
    } else {
      super.copyFrom(srcImage, srcCoords, destCoords);
    }
  }

  /**
   * Creates a new WebGL texture from another image
   * @param canvas WebGL context
   * @param srcImage Source image
   * @param extraFlags Additional flags. InputOnly is always enabled for textures created via this function.
   */
  public static createFrom(canvas: FimNodeGLCanvas, srcImage: FimGreyscaleBuffer | FimRgbaBuffer | FimNodeCanvas |
      FimNodeGLCanvas, extraFlags = FimGLTextureFlags.None): FimGLTexture {
    // Calculate parameters with defaults and extras
    let channels = (srcImage instanceof FimGreyscaleBuffer) ? FimColorChannels.Greyscale : FimColorChannels.RGBA;
    let bpp = FimBitsPerPixel.BPP8;
    let flags = FimGLTextureFlags.InputOnly | extraFlags;

    let texture = new FimNodeGLTexture(canvas, srcImage.w, srcImage.h, { channels, bpp, textureFlags: flags });
    texture.copyFrom(srcImage);
    return texture;
  }
}

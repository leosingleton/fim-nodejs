// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimColor, FimGLTexture, FimGLTextureOptions, FimRect, FimGreyscaleBuffer,
  FimRgbaBuffer } from '@leosingleton/fim';
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
   * @param initialColor If specified, the texture is initalized to this color
   */
  protected constructor(glCanvas: FimNodeGLCanvas, width?: number, height?: number, options?: FimGLTextureOptions,
      initialColor?: FimColor | string) {
    super(glCanvas, width, height, options, initialColor);
  }

  /**
   * Copies image from another. Neither cropping nor rescaling is supported.
   * @param srcImage Source image
   * @param srcCoords Provided for consistency with other copyFrom() functions. Must be undefined.
   * @param destCoords Provided for consistency with other copyFrom() functions. Must be undefined.
   */
  public copyFrom(srcImage: FimNodeCanvas | FimNodeGLCanvas | FimGreyscaleBuffer | FimRgbaBuffer,
      srcCoords?: FimRect, destCoords?: FimRect): void {
    if (srcImage instanceof FimNodeCanvas || srcImage instanceof FimNodeGLCanvas) {
      // headless-gl seems to have an issue when copying a texture from a canvas. Workaround by using an intermediate
      // binary buffer.
      using(this.fim.createRgbaBuffer(srcImage.w, srcImage.h), temp => {
        temp.copyFrom(srcImage);
        this.copyFrom(temp, srcCoords, destCoords);
      });
    } else {
      super.copyFrom(srcImage, srcCoords, destCoords);
    }
  }
}

/** Internal only version of the class */
export class _FimNodeGLTexture extends FimNodeGLTexture {
  public constructor(glCanvas: FimNodeGLCanvas, width?: number, height?: number, options?: FimGLTextureOptions,
    initialColor?: FimColor | string) {
    super(glCanvas, width, height, options, initialColor);
  }
}

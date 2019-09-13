// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
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
}

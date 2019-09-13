// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvasFactory } from './NodeOffscreenCanvas';
import { FimGLCapabilities } from '@leosingleton/fim';

/**
 * Enhanced version of FimGLCapabilities to support Node.js
 */
export namespace FimNodeGLCapabilities {
  /** Returns the WebGL capabilities of the current browser */
  export function getCapabilities(): FimGLCapabilities {
    return FimGLCapabilities.getCapabilities(NodeOffscreenCanvasFactory);
  }
}

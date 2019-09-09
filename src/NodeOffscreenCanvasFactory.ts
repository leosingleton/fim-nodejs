// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { IDisposable } from '@leosingleton/commonlibs';

export function FimNodeOffscreenCanvasFactory(width: number, height: number): OffscreenCanvas & IDisposable {
  return new NodeOffscreenCanvas(width, height);
}

class NodeOffscreenCanvas implements OffscreenCanvas, IDisposable {
  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.context = require('gl')(width, height);
  }

  public readonly width: number;
  public readonly height: number;

  public dispose(): void {
    let ext = this.context.getExtension('STACKGL_destroy_context');
    ext.destroy();
  }

  public convertToBlob(options?: ImageEncodeOptions): Promise<Blob> {
    throw new Error('not impl');
  }

  public getContext(contextId: OffscreenRenderingContextId, options?: any): OffscreenRenderingContext {
    if (contextId === 'webgl') {
      return this.context;
    } else {
      throw new Error('Only WebGL is supported');
    }
  }

  public transferToImageBitmap(): ImageBitmap {
    throw new Error('Not Implemented');
  }

  public addEventListener(type: string, listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions): void {

  }

  public dispatchEvent(event: Event): boolean {
    return true;
  }

  public removeEventListener(type: string, listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions): void {

  }

  private context: WebGLRenderingContext;
}

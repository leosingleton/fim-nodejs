// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { IDisposable } from '@leosingleton/commonlibs';
import { createCanvas, Canvas } from 'canvas';

export function FimNodeOffscreenCanvasFactory(width: number, height: number): OffscreenCanvas & IDisposable {
  return new NodeOffscreenCanvas(width, height);
}

class NodeOffscreenCanvas implements OffscreenCanvas, IDisposable {
  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public readonly width: number;
  public readonly height: number;

  public dispose(): void {
    let gl = this.glContext;
    if (gl) {
      let ext = gl.getExtension('STACKGL_destroy_context');
      ext.destroy();
    }
  }

  public convertToBlob(options?: ImageEncodeOptions): Promise<Blob> {
    throw new Error('not impl');
  }

  public getContext(contextId: OffscreenRenderingContextId, options?: any): OffscreenRenderingContext {
    if (this.contextId && this.contextId !== contextId) {
      throw new Error('Invalid contextId');
    }

    let w = this.width;
    let h = this.height;
  
    switch (contextId) {
      case '2d':
        let canvasContext = this.canvasContext;
        if (!canvasContext) {
          let canvas = this.canvas = createCanvas(w, h);
          canvasContext = this.canvasContext = canvas.getContext('2d', options);
        }
        return canvasContext as any;
    
      case 'webgl':
        let glContext = this.glContext;
        if (!glContext) {
          glContext = this.glContext = require('gl')(w, h);
        }
        return glContext;

      default:
        throw new Error('Only Canvas2D and WebGL are supported');
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

  private contextId?: '2d' | 'gl';
  private glContext: WebGLRenderingContext;
  private canvas: Canvas;
  private canvasContext: CanvasRenderingContext2D;
}

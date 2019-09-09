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
    switch (this.contextId) {
      case '2d':
        return this.convertToBlob2D(options);

      case 'webgl':
        return this.convertToBlobGL(options);

      default:
        this.invalidContextId();
    }
  }

  private async convertToBlob2D(options?: ImageEncodeOptions): Promise<Blob> {
    const png = 'image/png';
    const jpeg = 'image/jpeg';
    let canvas = this.canvas;

    // The default output type is PNG
    if (!options || options.type === png) {
      let buffer = canvas.toBuffer(png);
      return new Blob([buffer], { type: png });
    } else if (options.type === jpeg) {
      let buffer = canvas.toBuffer(jpeg, { quality: options.quality });
      return new Blob([buffer], { type: jpeg });
    } else {
      throw new Error('Invalid: ' + options.type);
    }
  }

  private convertToBlobGL(options?: ImageEncodeOptions): Promise<Blob> {
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
        this.invalidContextId();
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

  private invalidContextId(): never {
    throw new Error('Only Canvas2D and WebGL are supported');
  }

  private contextId?: '2d' | 'webgl';
  private glContext: WebGLRenderingContext;
  private canvas: Canvas;
  private canvasContext: CanvasRenderingContext2D;
}

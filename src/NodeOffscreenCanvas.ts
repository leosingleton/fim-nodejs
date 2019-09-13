// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeCanvas } from './FimNodeCanvas';
import { IDisposable, DisposableSet } from '@leosingleton/commonlibs';
import { createCanvas, Canvas } from 'canvas';
import createContext from 'gl';
import { FimRgbaBuffer } from '@leosingleton/fim';

export const enum MimeTypes {
  PNG = 'image/png',
  JPEG = 'image/jpeg'
}

export function NodeOffscreenCanvasFactory(width: number, height: number): OffscreenCanvas & IDisposable {
  return new NodeOffscreenCanvas(width, height);
}

export class NodeOffscreenCanvas implements OffscreenCanvas, IDisposable {
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

  public convertToBuffer(options?: ImageEncodeOptions): Promise<Buffer> {
    switch (this.contextId) {
      case '2d':
        return this.convertToBuffer2D(options);

      case 'webgl':
        return this.convertToBufferGL(options);

      default:
        this.invalidContextId();
    }
  }

  private async convertToBuffer2D(options?: ImageEncodeOptions): Promise<Buffer> {
    let canvas = this.canvas;

    // The default output type is PNG
    if (!options || options.type === MimeTypes.PNG) {
      return canvas.toBuffer(MimeTypes.PNG);
    } else if (options.type === MimeTypes.JPEG) {
      return canvas.toBuffer(MimeTypes.JPEG, { quality: options.quality });
    } else {
      throw new Error('Invalid: ' + options.type);
    }
  }

  private async convertToBufferGL(options?: ImageEncodeOptions): Promise<Buffer> {
    let gl = this.glContext;
    let w = this.width;
    let h = this.height;
    let result: Buffer;

    await DisposableSet.usingAsync(async disposable => {
      // Read the raw pixels into a byte array
      let temp1 = disposable.addDisposable(new FimRgbaBuffer(w, h));
      let pixels = temp1.getBuffer();
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      // Copy the pixels onto a canvas
      let temp2 = disposable.addDisposable(new FimNodeCanvas(w, h));
      await temp2.copyFromAsync(temp1);

      // Use convertToBuffer2D to convert to PNG or JPEG
      let canvas = temp2.getNodeCanvas();
      result = await canvas.convertToBuffer2D(options);
    });

    return result;
  }

  public async convertToBlob(options?: ImageEncodeOptions): Promise<Blob> {
    let buffer = await this.convertToBuffer(options);
    return new Blob([buffer], { type: options ? options.type || MimeTypes.PNG : MimeTypes.PNG });
  }

  public getContext(contextId: OffscreenRenderingContextId, options?: any): OffscreenRenderingContext {
    if (this.contextId && this.contextId !== contextId) {
      throw new Error('Invalid contextId');
    }

    let w = this.width;
    let h = this.height;
  
    let context: OffscreenRenderingContext;
    switch (contextId) {
      case '2d':
        let canvasContext = this.canvasContext;
        if (!canvasContext) {
          let canvas = this.canvas = createCanvas(w, h);
          canvasContext = this.canvasContext = canvas.getContext('2d', options);
        }
        context = canvasContext as any;
        break;
    
      case 'webgl':
        let glContext = this.glContext;
        if (!glContext) {
          glContext = this.glContext = createContext(w, h);

          // The gl library doesn't populate the canvas read-only property, which FIM needs. Force it.
          (glContext.canvas as any) = this;
        }
        context = glContext;
        break;

      default:
        this.invalidContextId();
    }

    this.contextId = contextId;
    return context;
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

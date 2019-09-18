// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { IDisposable } from '@leosingleton/commonlibs';
import { FimGLError } from '@leosingleton/fim';
import { Canvas, createCanvas, createImageData } from 'canvas';
import createContext from 'gl';

export const enum MimeTypes {
  PNG = 'image/png',
  JPEG = 'image/jpeg'
}

export function NodeOffscreenCanvasFactory(width: number, height: number, canvasId: string): OffscreenCanvas &
    IDisposable {
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
      delete this.glContext;
    }
  }

  public async convertToBuffer(options?: ImageEncodeOptions): Promise<Buffer> {
    switch (this.contextId) {
      case '2d':
        return this.convertToBuffer2D(options);

      case 'webgl':
        return this.convertToBufferGL(options);

      default:
        this.invalidContextId();
    }
  }

  private convertToBuffer2D(options?: ImageEncodeOptions): Buffer {
    return NodeOffscreenCanvas.convertCanvasToBuffer2D(this.canvas, options);
  }

  private static convertCanvasToBuffer2D(canvas: Canvas, options?: ImageEncodeOptions): Buffer {
    // The default output type is PNG
    if (!options || options.type === MimeTypes.PNG) {
      return canvas.toBuffer(MimeTypes.PNG);
    } else if (options.type === MimeTypes.JPEG) {
      return canvas.toBuffer(MimeTypes.JPEG, { quality: options.quality });
    } else {
      throw new Error('Invalid: ' + options.type);
    }
  }

  private convertToBufferGL(options?: ImageEncodeOptions): Buffer {
    let gl = this.glContext;
    let w = this.width;
    let h = this.height;

    // Read the raw pixels into a byte array
    let raw = new Uint8Array(w * h * 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    FimGLError.throwOnError(gl);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, raw);
    FimGLError.throwOnError(gl);

    // Flip the image on the Y axis
    let row = w * 4;
    let temp = new Uint8Array(row);
    for (let y = 0; y < Math.floor(h / 2); y++) {
      let offset1 = y * row;
      let offset2 = (h - y - 1) * row;
      temp.set(raw.subarray(offset1, offset1 + row));
      raw.set(raw.subarray(offset2, offset2 + row), offset1);
      raw.set(temp, offset2);
    }

    // Copy the raw pixels on to a Canvas
    let canvas = new Canvas(w, h);
    let ctx = canvas.getContext('2d');
    let img = createImageData(new Uint8ClampedArray(raw), w, h);
    ctx.putImageData(img, 0, 0);

    // The rest of the code is shared with Canvas2D
    return NodeOffscreenCanvas.convertCanvasToBuffer2D(canvas, options);
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

// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { IDisposable } from '@leosingleton/commonlibs';
import { createCanvas, Canvas } from 'canvas';
import createContext from 'gl';
import { FimCanvas } from '@leosingleton/fim';

const enum MimeTypes {
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

  private convertToBufferGL(options?: ImageEncodeOptions): Promise<Buffer> {
    // Just copy the WebGL canvas to a temporary Canvas2D and use its conversion functions
    let temp = new FimCanvas(this.width, this.height, null, NodeOffscreenCanvasFactory);
    try {
      // Create a drawing context to force the underlying offscreen canvas to get allocated
      let ctx = temp.createDrawingContext();
      ctx.dispose();

      let oc = temp.getCanvas() as any as NodeOffscreenCanvas;
      return oc.convertToBuffer2D(options);
    } finally {
      temp.dispose();
    }
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

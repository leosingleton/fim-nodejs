// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvasFactory, NodeOffscreenCanvas } from '../NodeOffscreenCanvas';
import { FimCanvasType } from '@leosingleton/fim';

describe('NodeOffscreenCanvas', () => {

  it('Creates and disposes', () => {
    let oc = NodeOffscreenCanvasFactory(100, 200, FimCanvasType.Canvas2D, null);
    expect(oc.width).toBe(100);
    expect(oc.height).toBe(200);
    oc.dispose();

    // No error on double-dispose
    oc.dispose();
  });

  it('Gets a Canvas2D drawing context', () => {
    let oc = NodeOffscreenCanvasFactory(100, 200, FimCanvasType.Canvas2D, null);
    let ctx = oc.getContext('2d') as OffscreenCanvasRenderingContext2D;
    expect(ctx).toBeDefined();

    ctx.fillStyle = '#00f';
    ctx.rect(20, 20, 80, 180);
    ctx.fill();
    oc.dispose();    
  });

  it('Gets a WebGL rendering context', () => {
    let oc = NodeOffscreenCanvasFactory(100, 200, FimCanvasType.WebGL, null);
    let ctx = oc.getContext('webgl') as WebGLRenderingContext;
    expect(ctx).toBeDefined();
  });

  it('Exports to JPEG', async () => {
    let oc = NodeOffscreenCanvasFactory(100, 200, FimCanvasType.WebGL, null) as NodeOffscreenCanvas;
    let ctx = oc.getContext('webgl') as WebGLRenderingContext;
    expect(ctx).toBeDefined();

    let buffer = await oc.convertToBuffer({ type: 'image/jpeg', quality: 0.9 });
    let jpeg = new Uint8Array(buffer);

    // JPEG magic number is FF D8 FF
    expect(jpeg[0]).toBe(0xff);
    expect(jpeg[1]).toBe(0xd8);
    expect(jpeg[2]).toBe(0xff);
  });

  it('Exports to PNG', async () => {
    let oc = NodeOffscreenCanvasFactory(100, 200, FimCanvasType.WebGL, null) as NodeOffscreenCanvas;
    let ctx = oc.getContext('webgl') as WebGLRenderingContext;
    expect(ctx).toBeDefined();

    let buffer = await oc.convertToBuffer({ type: 'image/png' });
    let png = new Uint8Array(buffer);

    // PNG magic number is 89 50 4E 47 (ASCII for .PNG)
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
    expect(png[2]).toBe(0x4e);
    expect(png[3]).toBe(0x47);
  });

});

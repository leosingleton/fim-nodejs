// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeGLCanvas } from '../FimNodeGLCanvas';
import { FimColor } from '@leosingleton/fim';

describe('FimNodeGLCanvas', () => {

  it('Creates, fills, and disposes', () => {
    let canvas = new FimNodeGLCanvas(100, 200, '#f00');
    expect(canvas.w).toBe(100);
    expect(canvas.h).toBe(200);
    expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));
    canvas.dispose();

    // No error on double-dispose
    canvas.dispose();
  });

});

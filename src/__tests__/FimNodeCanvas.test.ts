// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeCanvas } from '../FimNodeCanvas';
import { using } from '@leosingleton/commonlibs';
import { FimColor, FimTestImages } from '@leosingleton/fim';

describe('FimNodeCanvas', () => {

  it('Creates, fills, and disposes', () => {
    let canvas = new FimNodeCanvas(100, 200, '#f00');
    expect(canvas.w).toBe(100);
    expect(canvas.h).toBe(200);
    expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));
    canvas.dispose();

    // No error on double-dispose
    canvas.dispose();
  });

  it('Imports from JPEG', async () => {
    let jpeg = new Uint8Array(Buffer.from(FimTestImages.fourSquaresJpegBase64, 'base64'));
    using(await FimNodeCanvas.createFromJpeg(jpeg), canvas => {
      expect(canvas.w).toEqual(128);
      expect(canvas.h).toEqual(128);

      function expectToBeCloseTo(actual: FimColor, expected: FimColor): void {
        expect(actual.r).toBeCloseTo(expected.r, -0.5);
        expect(actual.g).toBeCloseTo(expected.g, -0.5);
        expect(actual.b).toBeCloseTo(expected.b, -0.5);  
        expect(actual.a).toBeCloseTo(expected.a, -0.5);  
      }

      expectToBeCloseTo(canvas.getPixel(32, 32), FimColor.fromString('#f00'));
      expectToBeCloseTo(canvas.getPixel(96, 32), FimColor.fromString('#0f0'));
      expectToBeCloseTo(canvas.getPixel(32, 96), FimColor.fromString('#00f'));
      expectToBeCloseTo(canvas.getPixel(96, 96), FimColor.fromString('#000'));
    });
  });

});

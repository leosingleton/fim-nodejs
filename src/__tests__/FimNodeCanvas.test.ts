// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNode } from '../FimNode';
import { DisposableSet, using, usingAsync } from '@leosingleton/commonlibs';
import { Fim, FimColor, FimTestImages } from '@leosingleton/fim';

function expectToBeCloseTo(actual: FimColor, expectedColor: string): void {
  let expected = FimColor.fromString(expectedColor);
  expect(actual.r).toBeCloseTo(expected.r, -0.5);
  expect(actual.g).toBeCloseTo(expected.g, -0.5);
  expect(actual.b).toBeCloseTo(expected.b, -0.5);  
  expect(actual.a).toBeCloseTo(expected.a, -0.5);  
}

describe('FimNodeCanvas', () => {

  it('Creates, fills, and disposes', () => {
    using(new FimNode() as Fim, fim => {
      let canvas = fim.createCanvas(100, 200, '#f00');
      expect(canvas.w).toBe(100);
      expect(canvas.h).toBe(200);
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));
      canvas.dispose();
  
      // No error on double-dispose
      canvas.dispose();  
    });
  });

  it('Imports from JPEG', async () => {
    let jpeg = new Uint8Array(Buffer.from(FimTestImages.fourSquaresJpegBase64, 'base64'));
    await usingAsync(new FimNode() as Fim, async fim => {
      using(await fim.createCanvasFromJpegAsync(jpeg), canvas => {
        expect(canvas.w).toEqual(128);
        expect(canvas.h).toEqual(128);
  
        expectToBeCloseTo(canvas.getPixel(32, 32), '#f00');
        expectToBeCloseTo(canvas.getPixel(96, 32), '#0f0');
        expectToBeCloseTo(canvas.getPixel(32, 96), '#00f');
        expectToBeCloseTo(canvas.getPixel(96, 96), '#000');
      });  
    });
  });

  it('Exports to JPEG', async () => {
    await DisposableSet.usingAsync(async disposable => {
      let fim = new FimNode() as Fim;
      let canvas1 = disposable.addDisposable(fim.createCanvas(200, 100, '#f00'));
      let jpeg = await canvas1.toJpeg();

      // JPEG magic number is FF D8 FF
      expect(jpeg[0]).toBe(0xff);
      expect(jpeg[1]).toBe(0xd8);
      expect(jpeg[2]).toBe(0xff);
  
      // Decode the JPEG
      let canvas2 = disposable.addDisposable(await fim.createCanvasFromJpegAsync(jpeg));
      expect(canvas2.w).toBe(200);
      expect(canvas2.h).toBe(100);
      expectToBeCloseTo(canvas2.getPixel(50, 50), '#f00');
    });
  });

  it('Copies from FimNodeCanvas', async () => {
    await DisposableSet.usingAsync(async disposable => {
      let fim = new FimNode() as Fim;
      let canvas1 = disposable.addDisposable(fim.createCanvas(240, 240, '#00f'));
      let canvas2 = disposable.addDisposable(fim.createCanvas(240, 240));
      canvas2.copyFrom(canvas1);
      expect(canvas2.getPixel(50, 50)).toEqual(FimColor.fromString('#00f'));
    });
  });

  it('Copies from FimNodeGLCanvas', async () => {
    await DisposableSet.usingAsync(async disposable => {
      let fim = new FimNode() as Fim;
      let gl = disposable.addDisposable(fim.createGLCanvas(240, 240, '#00f'));
      let canvas = disposable.addDisposable(fim.createCanvas(240, 240));
      canvas.copyFrom(gl);
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#00f'));
    });
  });

});

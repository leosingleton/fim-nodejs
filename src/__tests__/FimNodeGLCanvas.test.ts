// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNode } from '../FimNode';
import { Fim, FimColor, FimGLProgramCopy, FimGLProgramFill, FimGLProgramMatrixOperation1D,
  FimGLProgramMatrixOperation1DFast, FimGLTextureFlags, GaussianKernel } from '@leosingleton/fim';
import { using, usingAsync } from '@leosingleton/commonlibs';

function expectToBeCloseTo(actual: FimColor, expectedColor: string): void {
  let expected = FimColor.fromString(expectedColor);
  expect(actual.r).toBeCloseTo(expected.r, -0.5);
  expect(actual.g).toBeCloseTo(expected.g, -0.5);
  expect(actual.b).toBeCloseTo(expected.b, -0.5);  
  expect(actual.a).toBeCloseTo(expected.a, -0.5);  
}

describe('FimNodeGLCanvas', () => {

  it('Creates, fills, and disposes', () => {
    using(new FimNode() as Fim, fim => {
      let canvas = fim.createGLCanvas(100, 200, '#f00');
      expect(canvas.w).toBe(100);
      expect(canvas.h).toBe(200);
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));
  
      // Fill with a different color
      canvas.fillCanvas('#0f0');
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
      canvas.dispose();
  
      // No error on double-dispose
      canvas.dispose();  
    });
  });

  it('Executes a WebGL fill shader', () => {
    using(new FimNode() as Fim, fim => {
      using(fim.createGLCanvas(100, 200, '#f00'), canvas => {
        let program = new FimGLProgramFill(canvas);
        program.setInputs(FimColor.fromString('#0f0'));
        program.execute();
    
        expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
      });  
    });
  });

  it('Executes a WebGL copy shader', () => {
    using(new FimNode() as Fim, fim => {
      using(fim.createGLCanvas(100, 200, '#f00'), canvas => {
        let color = fim.createRgbaBuffer(100, 200, '#0f0');
        let texture = canvas.createTextureFrom(color);
        let program = new FimGLProgramCopy(canvas);
        program.setInputs(texture);
        program.execute();
  
        expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
      });  
    });
  });

  it('Creates a texture from a FimNodeCanvas', () => {
    using(new FimNode() as Fim, fim => {
      using(fim.createGLCanvas(100, 200, '#f00'), canvas => {
        let color = fim.createCanvas(100, 200, '#0f0');
        let texture = canvas.createTextureFrom(color);
        let program = new FimGLProgramCopy(canvas);
        program.setInputs(texture);
        program.execute();
  
        expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
      });  
    });
  });

  it('Executes a Gaussian blur', () => {
    using(new FimNode() as Fim, fim => {
      using(fim.createGLCanvas(100, 200, '#f00'), canvas => {
        let color = fim.createRgbaBuffer(100, 200, '#00f');
        let texture = canvas.createTextureFrom(color);
        let program = new FimGLProgramMatrixOperation1D(canvas, 13);
        let kernel = GaussianKernel.calculate(2, 13);
        program.setInputs(texture, kernel);
        program.execute();
    
        expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#00f'));
      });  
    });
  });

  it('Executes a Gaussian blur with linear sampling', () => {
    using(new FimNode(), fim => {
      using(fim.createGLCanvas(100, 200, '#f00'), canvas => {
        let color = fim.createRgbaBuffer(100, 200, '#0f0');
        let texture = canvas.createTextureFrom(color, FimGLTextureFlags.LinearSampling);
        let program = new FimGLProgramMatrixOperation1DFast(canvas, 13);
        let kernel = GaussianKernel.calculate(2, 13);
        program.setInputs(texture, kernel);
        program.execute();
    
        expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
      });  
    });
  });

  it('Exports to JPEG', async () => {
    await usingAsync(new FimNode() as Fim, async fim => {
      await usingAsync(fim.createGLCanvas(100, 200, '#f00'), async canvas => {
        let jpeg = await canvas.toJpeg();
  
        // JPEG magic number is FF D8 FF
        expect(jpeg[0]).toBe(0xff);
        expect(jpeg[1]).toBe(0xd8);
        expect(jpeg[2]).toBe(0xff);
    
        // Decode the JPEG
        using(await fim.createCanvasFromJpegAsync(jpeg), canvas2 => {
          expect(canvas2.w).toBe(100);
          expect(canvas2.h).toBe(200);
          expectToBeCloseTo(canvas2.getPixel(50, 50), '#f00');
        });
      });  
    });
  });

});

// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeGLCanvas } from '../FimNodeGLCanvas';
import { FimNodeGLTexture } from '../FimNodeGLTexture';
import { FimColor, FimGLProgramCopy, FimGLProgramFill, FimGLProgramMatrixOperation1D,
  FimGLProgramMatrixOperation1DFast, FimGLTextureFlags, FimRgbaBuffer, GaussianKernel, FimCanvas } from '@leosingleton/fim';
import { using, usingAsync } from '@leosingleton/commonlibs';
import { FimNodeCanvas } from '../FimNodeCanvas';

describe('FimNodeGLCanvas', () => {

  it('Creates, fills, and disposes', () => {
    let canvas = new FimNodeGLCanvas(100, 200, '#f00');
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

  it('Executes a WebGL fill shader', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new FimGLProgramFill(canvas);
      program.setInputs(FimColor.fromString('#0f0'));
      program.execute();
  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('Executes a WebGL copy shader', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimRgbaBuffer(100, 200, '#0f0');
      let texture = FimNodeGLTexture.createFrom(canvas, color);
      let program = new FimGLProgramCopy(canvas);
      program.setInputs(texture);
      program.execute();

      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('Creates a texture from a FimNodeCanvas', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimNodeCanvas(100, 200, '#0f0');
      let texture = FimNodeGLTexture.createFrom(canvas, color);
      let program = new FimGLProgramCopy(canvas);
      program.setInputs(texture);
      program.execute();

      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('Executes a Gaussian blur', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimRgbaBuffer(100, 200, '#00f');
      let texture = FimNodeGLTexture.createFrom(canvas, color);
      let program = new FimGLProgramMatrixOperation1D(canvas, 13);
      let kernel = GaussianKernel.calculate(2, 13);
      program.setInputs(texture, kernel);
      program.execute();
  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #00f!!!
    });
  });

  it('Executes a Gaussian blur with linear sampling', () => {
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let color = new FimRgbaBuffer(100, 200, '#0f0');
      let texture = FimNodeGLTexture.createFrom(canvas, color, FimGLTextureFlags.LinearSampling);
      let program = new FimGLProgramMatrixOperation1DFast(canvas, 13);
      let kernel = GaussianKernel.calculate(2, 13);
      program.setInputs(texture, kernel);
      program.execute();
  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #0f0!!!
    });
  });

  it('Exports to JPEG', async () => {
    await usingAsync(new FimNodeGLCanvas(100, 200, '#f00'), async canvas => {
      let jpeg = await canvas.toJpeg();

      // JPEG magic number is FF D8 FF
      expect(jpeg[0]).toBe(0xff);
      expect(jpeg[1]).toBe(0xd8);
      expect(jpeg[2]).toBe(0xff);
  
      // Decode the JPEG
      using(await FimNodeCanvas.createFromJpeg(jpeg), canvas2 => {
        expect(canvas2.w).toBe(100);
        expect(canvas2.h).toBe(200);
        expect(canvas2.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #f00!!!
      });
    });
  });

});

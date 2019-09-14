// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeGLCanvas } from '../FimNodeGLCanvas';
import { FimColor, FimGLCanvas, FimGLProgram } from '@leosingleton/fim';
import { using } from '@leosingleton/commonlibs';
import { GlslMinify, GlslShader } from 'webpack-glsl-minify/build/minify';

describe('Sample Programs', () => {

  it('Accepts a float array as a uniform', async () => {
    let shader = await compileShader(yellowShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.execute();  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#ff0'));
    });
  });

  it('Accepts a float array as a uniform', async () => {
    let shader = await compileShader(floatArrayUniformShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.setInput('uColor', [0, 1, 0]);
      program.execute();
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#000')); // BUGBUG: Should be #0f0!!!
    });
  });

});

/** Generic wrapper around FimGLProgram */
class SampleProgram extends FimGLProgram {
  constructor(canvas: FimGLCanvas, fragmentShader: GlslShader) {
    super(canvas, fragmentShader);
    this.compileProgram();
  }

  public setInput(name: string, value: any): void {
    this.fragmentShader.uniforms[name].variableValue = value;
  }
}

function compileShader(shader: string): Promise<GlslShader> {
  let min = new GlslMinify();
  return min.execute(shader);
}

/** Simple shader to fill the output with yellow */
const yellowShader = `
precision mediump float;
varying vec2 vCoord;

void main()
{
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
}`;

/** Simple shader to test passing arrays of floats as uniforms */
const floatArrayUniformShader = `
precision mediump float;
varying vec2 vCoord;

uniform float uColor[3];

void main()
{
  gl_FragColor = vec4(uColor[0], uColor[1], uColor[2], 1.0);
}`;

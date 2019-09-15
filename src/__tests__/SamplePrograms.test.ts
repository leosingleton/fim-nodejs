// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeGLCanvas } from '../FimNodeGLCanvas';
import { FimColor, FimGLCanvas, FimGLProgram } from '@leosingleton/fim';
import { using } from '@leosingleton/commonlibs';
import { GlslMinify, GlslShader } from 'webpack-glsl-minify/build/minify';

describe('Sample Programs', () => {

  it('Accepts no uniforms', async () => {
    let shader = await compileShader(yellowShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.execute();  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#ff0'));
    });
  });

  it('Accepts a float as a uniform', async () => {
    let shader = await compileShader(floatUniformShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.setInput('uGreen', 1);
      program.execute();  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('Accepts a vec3 as a uniform', async () => {
    let shader = await compileShader(vectorUniformShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.setInput('uColor', [0, 1, 0]);
      program.execute();  
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('Accepts a float array as a uniform', async () => {
    let shader = await compileShader(floatArrayUniformShader);
    using(new FimNodeGLCanvas(100, 200, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.setInput('uColor', [0, 1, 0]);
      program.execute();
      expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#0f0'));
    });
  });

  it('getPixel() has the correct orientation', async () => {
    let shader = await compileShader(gradientShader);
    using(new FimNodeGLCanvas(1000, 1000, '#f00'), canvas => {
      let program = new SampleProgram(canvas, shader);
      program.execute();
      expect(canvas.getPixel(0, 0)).toEqual(FimColor.fromString('#000'));
      expect(canvas.getPixel(0, 999)).toEqual(FimColor.fromString('#000'));
      expect(canvas.getPixel(999, 0)).toEqual(FimColor.fromString('#fff'));
      expect(canvas.getPixel(999, 999)).toEqual(FimColor.fromString('#000'));
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
  let min = new GlslMinify({  
    preserveDefines: true,
    preserveUniforms: true,
    preserveVariables: true
  });
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

/** Simple shader to test passing of a float as uniforms */
const floatUniformShader = `
precision mediump float;
varying vec2 vCoord;

uniform float uGreen;

void main()
{
  gl_FragColor = vec4(0.0, uGreen, 0.0, 1.0);
}`;

/** Simple shader to test passing arrays of vectors as uniforms */
const vectorUniformShader = `
precision mediump float;
varying vec2 vCoord;

uniform vec3 uColor;

void main()
{
  gl_FragColor = vec4(uColor, 1.0);
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

/** Simple shader to ensure we have the orientation correct */
const gradientShader = `
precision mediump float;
varying vec2 vCoord;

void main()
{
  gl_FragColor = vec4(vec3(vCoord.x * vCoord.y), 1.0);
}`;

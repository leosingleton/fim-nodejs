// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimGLProgram, FimGLCanvas } from '@leosingleton/fim';
import { GlslMinify, GlslShader } from 'webpack-glsl-minify/build/minify';

/** WebGL program to draw a gradient from (0,0) to (1,1) */
export class GradientProgram extends FimGLProgram {
  private constructor(canvas: FimGLCanvas, fragmentShader: GlslShader) {
    super(canvas, fragmentShader);
    this.compileProgram();
  }

  public static async create(canvas: FimGLCanvas): Promise<GradientProgram> {
    const min = new GlslMinify({
      preserveDefines: true,
      preserveUniforms: true,
      preserveVariables: true
    });
    const shader = await min.execute(gradientShader);

    return new GradientProgram(canvas, shader);
  }
}

const gradientShader = `
precision mediump float;
varying vec2 vCoord;

void main()
{
  gl_FragColor = vec4(vec3(vCoord.x * vCoord.y), 1.0);
}`;

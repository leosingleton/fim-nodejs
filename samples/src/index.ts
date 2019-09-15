/*!
 * fim-node - Fast Image Manipulation Library for Node.js
 * Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
 * Released under the MIT license
 */

import { GradientProgram } from './GradientProgram';
import { FimNodeCanvas, FimNodeGLCanvas, FimNodeGLTexture } from '../../build/dist/index.js';
import { FimGLProgramMatrixOperation1DFast, FimGLTextureFlags, GaussianKernel } from '@leosingleton/fim';
import { readFileSync, writeFileSync } from 'fs';
import { buffer } from 'get-stdin';

// The NodeJS 10 LTS doesn't yet have support for async at the root level. Wrap a main function instead.
(async () => {
  let code = await main(process.argv);
  process.exit(code);
})().catch(err => {
  console.log(err);
  process.exit(-1);
});

export async function main(argv: string[]): Promise<number> {
  if (argv.length < 5) {
    usage();
    return -1;
  }

  let op = argv[2];
  let inFile = argv[3];
  let outFile = argv[4];

  let input: Buffer;
  if (inFile !== '--') {
    input = readFileSync(inFile);
  } else {
    input = await buffer();
  }

  let output = await processFile(op, input);

  if (outFile !== '--') {
    writeFileSync(outFile, output);
  } else {
    process.stdout.write(output);
  }

  return 0;
}

function usage(): void {
  process.stderr.write(
`Usage: node samples.js <operation> <input-file> <output-file>
  operation: one of the following:
    "copy" - Decompresses the input JPEG and recompresses it
    "gl-fill" - Outputs a red canvas created with a WebGL fill
    "gl-blur" - Blurs the input image with WebGL
  input-file: path to read the input JPEG or -- to read from stdin
  output-file: path to write the output JPEG or -- to write to stdout`);
}

async function processFile(op: string, input: Buffer): Promise<Buffer> {
  // Parse the input JPEG file
  let inputImage = await FimNodeCanvas.createFromJpeg(new Uint8Array(input));

  // Perform the requested operation
  let outputImage: FimNodeCanvas | FimNodeGLCanvas;
  try {
    switch (op) {
      case 'copy':
        outputImage = await copyOperation(inputImage);
        break;

      case 'gl-fill':
        outputImage = await glFillOperation(inputImage);
        break;

      case 'gl-gradient':
        outputImage = await glGradientOperation(inputImage);
        break;

      case 'gl-blur':
        outputImage = await glBlurOperation(inputImage);
        break;

      default:
        return null;
    }

    // Convert the output to JPEG
    return outputImage.toJpegBuffer();
  } finally {
    inputImage.dispose();
    if (outputImage) {
      outputImage.dispose();
    }
  }
}

async function copyOperation(inputImage: FimNodeCanvas): Promise<FimNodeCanvas> {
  return inputImage;
}

async function glFillOperation(inputImage: FimNodeCanvas): Promise<FimNodeGLCanvas> {
  return new FimNodeGLCanvas(inputImage.w, inputImage.h, '#00f');
}

async function glGradientOperation(inputImage: FimNodeCanvas): Promise<FimNodeGLCanvas> {
  let gl = new FimNodeGLCanvas(inputImage.w, inputImage.h);
  let program = await GradientProgram.create(gl);
  program.execute();
  return gl;
}

async function glBlurOperation(inputImage: FimNodeCanvas): Promise<FimNodeGLCanvas> {
  let gl = new FimNodeGLCanvas(inputImage.w, inputImage.h);
  let texture = FimNodeGLTexture.createFrom(gl, inputImage, FimGLTextureFlags.LinearSampling);
  let program = new FimGLProgramMatrixOperation1DFast(gl, 13);
  let kernel = GaussianKernel.calculate(2, 13);
  program.setInputs(texture, kernel);
  program.execute();
  return gl;
}

/*!
 * fim-nodejs - Fast Image Manipulation Library for NodeJS
 * Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
 * Released under the MIT license
 */

import { FimCanvasCreator, NodeOffscreenCanvas, NodeOffscreenCanvasFactory } from '../../build/dist/index.js';
import { FimCanvas, FimGLCanvas, FimGLTexture, FimGLProgramMatrixOperation1DFast, FimGLTextureFlags,
  GaussianKernel } from '@leosingleton/fim';
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
  let inputImage = await FimCanvasCreator.createFromJpeg(new Uint8Array(input));

  // Perform the requested operation
  let outputImage: FimCanvas | FimGLCanvas;
  try {
    switch (op) {
      case 'copy':
        outputImage = await copyOperation(inputImage);
        break;

      case 'gl-fill':
        outputImage = await glFillOperation(inputImage);
        break;

      case 'gl-blur':
        outputImage = await glBlurOperation(inputImage);
        break;

      default:
        return null;
    }

    // Convert the output to JPEG
    let canvas = outputImage.getCanvas() as any as NodeOffscreenCanvas;
    let buffer = await canvas.convertToBuffer({ type: 'image/jpeg', quality: 0.95 });
    return buffer;
  } finally {
    inputImage.dispose();
    if (outputImage) {
      outputImage.dispose();
    }
  }
}

async function copyOperation(inputImage: FimCanvas): Promise<FimCanvas> {
  return inputImage;
}

async function glFillOperation(inputImage: FimCanvas): Promise<FimGLCanvas> {
  return new FimGLCanvas(inputImage.w, inputImage.h, '#00f', NodeOffscreenCanvasFactory);
}

async function glBlurOperation(inputImage: FimCanvas): Promise<FimGLCanvas> {
  let gl = new FimGLCanvas(inputImage.w, inputImage.h, null, NodeOffscreenCanvasFactory);
  let texture = FimGLTexture.createFrom(gl, inputImage, FimGLTextureFlags.LinearSampling);
  let program = new FimGLProgramMatrixOperation1DFast(gl, 13);
  let kernel = GaussianKernel.calculate(2, 13);
  program.setInputs(texture, kernel);
  program.execute();
  return gl;
}

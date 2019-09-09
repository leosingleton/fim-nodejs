// fim-nodejs - Fast Image Manipulation Library for NodeJS
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimCanvasCreator, NodeOffscreenCanvas } from '../build/dist/index.js';
import { FimCanvas, FimGLCanvas } from '@leosingleton/fim';
import { readFileSync, writeFileSync } from 'fs';
import { buffer } from 'get-stdin';

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

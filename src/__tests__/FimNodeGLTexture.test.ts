// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNode } from '../FimNode';
import { Fim, FimColor, FimGLProgramCopy } from '@leosingleton/fim';
import { using } from '@leosingleton/commonlibs';

describe('FimNodeGLTexture', () => {

  it('Fills with solid colors', () => {
    using(new FimNode() as Fim, fim => {
      using(fim.createGLCanvas(200, 200), gl => {
        let texture = gl.createTexture();
        let program = new FimGLProgramCopy(gl);

        // Fill with red
        texture.fillTexture('#f00');
        program.setInputs(texture);
        program.execute();
        expect(gl.getPixel(100, 100)).toEqual(FimColor.fromString('#f00'));

        // Fill with blue
        texture.fillTexture('#00f');
        program.setInputs(texture);
        program.execute();
        expect(gl.getPixel(100, 100)).toEqual(FimColor.fromString('#00f'));

        texture.dispose();
        program.dispose();
      });
    });
  });

});

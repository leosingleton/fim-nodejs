// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { NodeOffscreenCanvas } from '../NodeOffscreenCanvas';

describe('NodeOffscreenCanvas', () => {

  it('Creates and disposes', () => {
    let oc = new NodeOffscreenCanvas(100, 200);
    expect(oc.width).toBe(100);
    expect(oc.height).toBe(200);
    oc.dispose();

    // No error on double-dispose
    oc.dispose();
  });

});

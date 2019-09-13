// fim-node - Fast Image Manipulation Library for Node.js
// Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
// See LICENSE in the project root for license information.

import { FimNodeCanvas } from '../FimNodeCanvas';
import { using } from '@leosingleton/commonlibs';
import { FimColor } from '@leosingleton/fim';

describe('FimNodeCanvas', () => {

  it('Creates, fills, and disposes', () => {
    let canvas = new FimNodeCanvas(100, 200, '#f00');
    expect(canvas.w).toBe(100);
    expect(canvas.h).toBe(200);
    expect(canvas.getPixel(50, 50)).toEqual(FimColor.fromString('#f00'));
    canvas.dispose();

    // No error on double-dispose
    canvas.dispose();
  });

  it('Imports from JPEG', async () => {
    // TODO: Move this back into FimTestImages!
    let jpegString =
      '/9j/4AAQSkZJRgABAQEAYABgAAD/4QBmRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAMBAAUA' +
      'AAABAAAAVgMDAAEAAAABAAAAAFEQAAEAAAABAQAAAFERAAQAAAABAAAOw1ESAAQAAAABAAAOwwAA' +
      'AAAAAYagAACxj//bAEMAAgEBAgEBAgICAgICAgIDBQMDAwMDBgQEAwUHBgcHBwYHBwgJCwkICAoI' +
      'BwcKDQoKCwwMDAwHCQ4PDQwOCwwMDP/bAEMBAgICAwMDBgMDBgwIBwgMDAwMDAwMDAwMDAwMDAwM' +
      'DAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDP/AABEIAIAAgAMBIgACEQEDEQH/xAAf' +
      'AAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEF' +
      'EiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJ' +
      'SlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3' +
      'uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEB' +
      'AAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIy' +
      'gQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNk' +
      'ZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfI' +
      'ycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APi+iiiv5TP9/AooooAK' +
      'KKKACusrk66yvYyn7Xy/U+dz/wD5d/P9D78ooor+Qz/h5CiiigAooooAKKKKAPzXooor+pD/ALqA' +
      'ooooAKKKKACusrk66yvYyn7Xy/U+dz//AJd/P9D78ooor+Qz/h5CiiigAooooAKKKKAPzXooor+p' +
      'D/uoCiiigAooooAK6yuTrrK9jKftfL9T53P/APl38/0Pvyiiiv5DP+HkKKKKACiiigAooooA+D6K' +
      '4eiv66/tT+7+P/AP+3z/AFX/AOnv/kv/AATuKK4eij+1P7v4/wDAD/Vf/p7/AOS/8E7iiuHoo/tT' +
      '+7+P/AD/AFX/AOnv/kv/AATuKz62K8/ror4z2dtL38zmyzLvb83vWtbp6+Z+lFFFFfx6f8RgUUUU' +
      'AFFFFABRRRQB+DdFFFf9ph/qwFFFFABRRRQAUUUUAeF0UUV/gGfqgUUUUAFFFFABRRRQB7pRRRX+' +
      '/h+VhRRRQAUUUUAFFFFAHhdFFFf4Bn6oFFFFABRRRQAUUUUAe6UUUV/v4flYUUUUAFFFFABRRRQB' +
      '4XRRRX+AZ+qBRRRQAUUUUAFFFFAHulFFFf7+H5WFFFFABRRRQAUUUUAeF0UUV/gGfqgUUUUAFFFF' +
      'ABRRRQB//9k=';

    let jpeg = new Uint8Array(Buffer.from(jpegString, 'base64'));
    using(await FimNodeCanvas.createFromJpeg(jpeg), canvas => {
      expect(canvas.w).toEqual(128);
      expect(canvas.h).toEqual(128);

      function expectToBeCloseTo(actual: FimColor, expected: FimColor): void {
        expect(actual.r).toBeCloseTo(expected.r, -0.5);
        expect(actual.g).toBeCloseTo(expected.g, -0.5);
        expect(actual.b).toBeCloseTo(expected.b, -0.5);  
        expect(actual.a).toBeCloseTo(expected.a, -0.5);  
      }

      expectToBeCloseTo(canvas.getPixel(32, 32), FimColor.fromString('#f00'));
      expectToBeCloseTo(canvas.getPixel(96, 32), FimColor.fromString('#0f0'));
      expectToBeCloseTo(canvas.getPixel(32, 96), FimColor.fromString('#00f'));
      expectToBeCloseTo(canvas.getPixel(96, 96), FimColor.fromString('#000'));
    });
  });

});

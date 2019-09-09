/*!
 * fim-nodejs - Fast Image Manipulation Library for NodeJS
 * Copyright (c) Leo C. Singleton IV <leo@leosingleton.com>
 * Released under the MIT license
 */

import { main } from './Main';

// The NodeJS 10 LTS doesn't yet have support for async at the root level. Wrap a main function instead.
(async () => {
  let code = await main(process.argv);
  process.exit(code);
})().catch(err => {
  console.log(err);
  process.exit(-1);
});

'use strict';

// @ts-ignore
const generated = require('../wpt/mimesniff/mime-types/resources/generated-mime-types.json');
// @ts-ignore
const curated = require('../wpt/mimesniff/mime-types/resources/generated-mime-types.json');
const { MIMEType } = require('../mime.js');
const assert = require('assert');
for (const { input, output } of [...curated, ...generated]) {
    if (typeof output === 'string') {
        const mime = new MIMEType(input);
        // @ts-expect-error ts fails to handle JSDoc
        assert.strictEqual(
            /** @type {boolean} */(mime instanceof MIMEType),
            true
        );
        // @ts-expect-error ts fails to handle JSDoc
        assert.strictEqual(
            /** @type {string} */(mime.toString()),
            output
        );
    } else {
        // eslint-disable-next-line dot-notation
        assert.throws(() => new MIMEType(input), 'SyntaxError');
    }
}

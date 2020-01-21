const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

const { expect } = Code;
const { it } = exports.lab = Lab.script();

it('returns true when 1 + 1 equals 2', () => {
  const server = require('../index.js');
  // expect(1 + 1).to.equal(2);
});
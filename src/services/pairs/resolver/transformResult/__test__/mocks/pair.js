const { BigNumber } = require('@local/data-entities');

const pair = {
  first_price: new BigNumber(0.00075632),
  last_price: new BigNumber(0.00074128),
  volume: new BigNumber(180232.92153489),
  volume_local: new BigNumber(200000),
};
const transformedPair = {
  firstPrice: new BigNumber(0.00075632),
  lastPrice: new BigNumber(0.00074128),
  volume: new BigNumber(180232.92153489),
  volumeLocal: new BigNumber(200000),
};

module.exports = {
  pair,
  transformedPair,
};

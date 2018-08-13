const { curry } = require('ramda');

const selectQuery = curry(({ query, queryWithLocal }, pair) => {
  if (pair.priceAsset === 'LOCAL' || pair.amountAsset === 'LOCAL')
    return query(pair);
  else return queryWithLocal(pair);
});

module.exports = selectQuery;

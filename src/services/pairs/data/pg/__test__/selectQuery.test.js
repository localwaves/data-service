const selectQuery = require('../adapter/selectQuery');
const sql = require('../sql');

describe('Pair db adapter `selectQuery` function', () => {
  it('covers case when LOCAL — amount asset', () => {
    const pair = {
      amountAsset: 'LOCAL',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.query(pair));
  });

  it('covers case when LOCAL — price asset', () => {
    const pair = {
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
      priceAsset: 'LOCAL',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.query(pair));
  });

  it('covers case when LOCAL is neither price nor amount asset', () => {
    const pair = {
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    expect(selectQuery(sql, pair)).toEqual(sql.queryWithLocal(pair));
  });
});

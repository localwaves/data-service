const { BigNumber } = require('@local/data-entities');

const transformResults = require('../adapter/transformResults');

const LOCAL_DECIMALS = 8;
const aDecimals = 8;
const pDecimals = 2;

const resultCommon = {
  a_decimals: aDecimals,
  p_decimals: pDecimals,
  first_price: new BigNumber(10).pow(8),
  last_price: new BigNumber(10).pow(8).multipliedBy(2),
  volume: new BigNumber(10).pow(10),
  volume_price_asset: new BigNumber(10).pow(10).multipliedBy(12),
};

describe('Pairs transformResult function', () => {
  it('covers case when LOCAL — amount asset', () => {
    const pair = {
      amountAsset: 'LOCAL',
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
    };
    const result = resultCommon;
    const expected = {
      first_price: new BigNumber(10).pow(6),
      last_price: new BigNumber(10).pow(6).multipliedBy(2),
      volume: new BigNumber(10).pow(2),
      volume_local: new BigNumber(10).pow(2),
    };

    expect(transformResults(pair)(result)).toEqual(expected);
  });

  it('covers case when LOCAL — price asset', () => {
    const pair = {
      priceAsset: 'LOCAL',
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
    };
    const result = resultCommon;
    const expected = {
      first_price: new BigNumber(10).pow(6),
      last_price: new BigNumber(10).pow(6).multipliedBy(2),
      volume: new BigNumber(10).pow(2),
      volume_local: new BigNumber(10).pow(2).multipliedBy(12),
    };

    expect(transformResults(pair)(result)).toEqual(expected);
  });

  describe('LOCAL is neither price nor amount asset', () => {
    const pair = {
      priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
    };

    it('covers case `priceAsset/LOCAL` is a valid pair, should multiply by avg_price', () => {
      const volumePriceAsset = new BigNumber(10).pow(10).multipliedBy(2);
      const avgPrice = new BigNumber(10).pow(6).multipliedBy(3);

      const result = {
        ...resultCommon,
        volume_price_asset: volumePriceAsset, // overriding for this test purposes
        avg_price_with_local: avgPrice,
        price_asset_with_local: 'LOCAL',
      };

      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_local: volumePriceAsset
          .multipliedBy(new BigNumber(10).pow(-pDecimals)) // to true volume
          .multipliedBy(avgPrice)
          .multipliedBy(new BigNumber(10).pow(-8 + pDecimals - LOCAL_DECIMALS)), // to true price (Local dec — 8)
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });

    it('covers case `LOCAL/priceAsset` is a valid pair, should divide by avg_price', () => {
      const volumePriceAsset = new BigNumber(10).pow(10).multipliedBy(6);
      const avgPrice = new BigNumber(10).pow(6).multipliedBy(3);

      const result = {
        ...resultCommon,
        volume_price_asset: volumePriceAsset, // overriding for this test purposes
        avg_price_with_local: avgPrice,
        price_asset_with_local: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };

      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_local: volumePriceAsset
          .multipliedBy(new BigNumber(10).pow(-pDecimals)) // to true volume
          .dividedBy(avgPrice)
          .dividedBy(new BigNumber(10).pow(-8 + LOCAL_DECIMALS - pDecimals)), // to true price (Local dec — 8)
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });
  });

  describe('corner cases', () => {
    it('LOCAL — amount asset, no transactions happened within a day', () => {
      const pair = {
        amountAsset: 'LOCAL',
        priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };

      expect(transformResults(pair)(null)).toEqual(null);
    });

    it('LOCAL — price asset, no transactions happened within a day', () => {
      const pair = {
        amountAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
        priceAsset: 'LOCAL',
      };

      expect(transformResults(pair)(null)).toEqual(null);
    });

    it('LOCAL is neither price nor amount, transactions within pair occured, but no transactions priceAsset--LOCAL happened', () => {
      const pair = {
        amountAsset: '474jTeYx2r2Va35794tCScAXWJG9hU2HcgxzMowaZUnu',
        priceAsset: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
      };
      const result = {
        ...resultCommon,
        avg_price_with_local: null,
        price_asset_with_local: null,
      };
      const expected = {
        first_price: new BigNumber(10).pow(6),
        last_price: new BigNumber(10).pow(6).multipliedBy(2),
        volume: new BigNumber(10).pow(2),
        volume_local: null,
      };

      expect(transformResults(pair)(result)).toEqual(expected);
    });
  });
});

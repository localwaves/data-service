const { curry } = require('ramda');

const { convertPrice, convertAmount } = require('../../../../../utils/satoshi');

const LOCAL_DECIMALS = 8;

/**
 * @typedef {object} PairDbResponse
 * @property {BigNumber} a_decimals
 * @property {BigNumber} p_decimals
 * @property {BigNumber} first_price
 * @property {BigNumber} last_price
 * @property {BigNumber} volume
 * @property {BigNumber} volume_price_asset
 * @property {BigNumber} [avg_price_with_local]
 * @property {BigNumber} [price_asset_with_local]
 */

/**
 * @typedef {object} PairInfoRaw
 * @property {BigNumber} first_price
 * @property {BigNumber} last_price
 * @property {BigNumber} volume
 * @property {BigNumber} volume_local
 */

/**
 * DB task returns array of values:
 * [aDecimals, pDecimals, firstPrice, lastPrice, volume, -volumeInPriceAsset, -avgPriceWithLocal]
 * depending on pair (does it have LOCAL and if does, in which position)
 * Possible cases:
 *  1. LOCAL — amount asset. Volume in local = volume
 *  2. LOCAL — price asset. Volume in Local = volume_in_price_asset
 *  3. LOCAL is not in pair
 *    3a. Correct pair LOCAL/priceAsset. Volume in local = volume_in_price_asset / avg_price to LOCAL
 *    3b. Correct pair priceAsset/LOCAL. Volume in local = volume_in_price_asset * avg_price to LOCAL
 * @typedef {function} transformResults
 * @returns PairInfoRaw
 */
const transformResults = curry(({ amountAsset, priceAsset }, result) => {
  if (result === null) return null;

  const {
    a_decimals: aDecimals,
    p_decimals: pDecimals,
    last_price: lastPrice,
    first_price: firstPrice,
    volume,
    volume_price_asset: volumePriceAsset,
    ...withLocal
  } = result;

  const resultCommon = {
    first_price: convertPrice(aDecimals, pDecimals, firstPrice),
    last_price: convertPrice(aDecimals, pDecimals, lastPrice),
    volume: convertAmount(aDecimals, volume),
  };

  switch (true) {
    case amountAsset === 'LOCAL':
      return {
        ...resultCommon,
        volume_local: resultCommon.volume,
      };
    case priceAsset === 'LOCAL': {
      return {
        ...resultCommon,
        volume_local: convertAmount(LOCAL_DECIMALS, volumePriceAsset),
      };
    }
    default: {
      const {
        avg_price_with_local: avgPriceWithLocal,
        price_asset_with_local: priceAssetWithLocal,
      } = withLocal;

      if (avgPriceWithLocal === null)
        return {
          ...resultCommon,
          volume_local: null,
        };

      const volumeConverted = convertAmount(pDecimals, volumePriceAsset);

      if (priceAssetWithLocal === 'LOCAL') {
        const priceConverted = convertPrice(
          pDecimals,
          LOCAL_DECIMALS,
          avgPriceWithLocal
        );
        return {
          ...resultCommon,
          volume_local: volumeConverted.multipliedBy(priceConverted),
        };
      } else {
        const priceConverted = convertPrice(
          LOCAL_DECIMALS,
          pDecimals,
          avgPriceWithLocal
        );
        return {
          ...resultCommon,
          volume_local: volumeConverted.dividedBy(priceConverted),
        };
      }
    }
  }
});

module.exports = transformResults;

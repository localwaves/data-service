const Joi = require('joi');
const { BigNumber } = require('@local/data-entities');

const assetsIdRegex = /[0-9A-Za-z]+/;

const pairInput = Joi.object().keys({
  amountAsset: Joi.string()
    .regex(assetsIdRegex)
    .required(),
  priceAsset: Joi.string()
    .regex(assetsIdRegex)
    .required(),
});

const output = Joi.object().keys({
  first_price: Joi.object()
    .type(BigNumber)
    .required(),
  last_price: Joi.object()
    .type(BigNumber)
    .required(),
  volume: Joi.object()
    .type(BigNumber)
    .required(),
  volume_local: Joi.object()
    .type(BigNumber)
    .required()
    .allow(null),
});

module.exports = { output, pairInput };

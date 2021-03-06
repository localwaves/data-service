const { one: createResolver } = require('../../resolvers/aliases');
const { select } = require('../utils/selectors');
const { captureErrors } = require('../../utils/captureErrors');

const resolver = async ctx => {
  const { alias: aliasName } = select(ctx).params;
  ctx.eventBus.emit('ENDPOINT_HIT', {
    url: ctx.originalUrl,
    resolver: 'aliases',
  });

  const resolver = createResolver({
    db: ctx.state.db,
    emitEvent: ctx.eventBus.emit,
  });

  const alias = await resolver(aliasName)
    .run()
    .promise();

  ctx.eventBus.emit('ENDPOINT_RESOLVED', {
    value: alias,
  });

  if (alias) {
    ctx.state.returnValue = alias;
  } else {
    ctx.status = 404;
    ctx.body = `Alias ${aliasName} not found`;
  }
};

const handleError = ({ ctx, error }) => {
  ctx.eventBus.emit('ERROR', error);
  error.matchWith({
    Db: () => {
      ctx.status = 500;
      ctx.body = 'Database Error';
    },
    Resolver: () => {
      ctx.status = 500;
      ctx.body = 'Error resolving /aliases/{id}';
    },
    Validation: () => {
      ctx.status = 400;
      ctx.body = `Invalid query, check params, got: ${ctx.querystring}`;
    },
  });
};

module.exports = captureErrors(handleError)(resolver);

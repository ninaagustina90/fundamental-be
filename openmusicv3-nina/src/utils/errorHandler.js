function errorHandler(err, h) {
  const message = err.message?.toLowerCase() || '';

  if (err.isJoi || message.includes('validation')) {
    return h
      .response({
        status: 'fail',
        message: err.message || 'Invalid request',
      })
      .code(400);
  }

  if (message.includes('not found')) {
    return h
      .response({
        status: 'fail',
        message: err.message || 'Resource not found',
      })
      .code(404);
  }

  if (message.includes('unauthorized') || message.includes('missing authorization')) {
    return h
      .response({
        status: 'fail',
        message: err.message || 'Unauthorized',
      })
      .code(401);
  }

  if (message.includes('forbidden')) {
    return h
      .response({
        status: 'fail',
        message: err.message || 'Forbidden',
      })
      .code(403);
  }

  if (message.includes('refresh token')) {
    return h
      .response({
        status: 'fail',
        message: err.message || 'Invalid refresh token',
      })
      .code(400);
  }

  return h
    .response({
      status: 'error',
      message: err.message || 'Internal server error',
    })
    .code(500);
}

module.exports = errorHandler;

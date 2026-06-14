const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, _next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  console.error('❌', err.message);
  res.status(status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };

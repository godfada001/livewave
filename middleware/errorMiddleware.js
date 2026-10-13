/*export function errorMiddleware(
  error,
  req,
  res,
  next
) {
  console.error(error)

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}*/
// middleware/errorMiddleware.js

export function errorMiddleware(error, req, res, next) {
  console.error(error)

  const status =
    Number.isInteger(error?.status) &&
    error.status >= 400 &&
    error.status < 600
      ? error.status
      : 500

  // Only errors that opt in (like HttpError) show their message to clients.
  // Anything unexpected stays generic so internals don't leak.
  res.status(status).json({
    success: false,
    message: error?.expose
      ? error.message
      : 'Internal server error'
  })
}
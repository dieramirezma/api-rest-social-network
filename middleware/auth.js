import jwt from 'jwt-simple'
import moment from 'moment'
import { secret } from '../services/jwt.js'

// Ensure that the token is valid
export const ensureAuth = (req, res, next) => {
  // (Check if the authorization header is present
  if (!req.headers.authorization) {
    return res.status(403).send({
      status: 'error',
      message: 'Authorization header not present'
    })
  }

  // Clean the token and remove quotes
  const token = req.headers.authorization.replace(/['"]+/g, '')

  try {
    // Decode the token
    const payload = jwt.decode(token, secret)

    // Check if the token has expired
    if (payload.exp <= moment().unix()) {
      return res.status(403).json({
        status: 'error',
        message: 'Token has expired'
      })
    }

    // Attach the payload to the request object
    req.user = payload
  } catch (error) {
    console.log(error)
    return res.status(403).json({
      status: 'error',
      message: 'Invalid token'
    })
  }

  next()
}

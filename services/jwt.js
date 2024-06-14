import jwt from 'jwt-simple'
import moment from 'moment'

// Secret key
const secret = 'SECRET_KEY_PROJECT'

// Create token
const createToken = (user) => {
  const payload = {
    userId: user._id,
    role: user.role,
    name: user.name,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  }

  // Return token
  return jwt.encode(payload, secret)
}

export {
  secret,
  createToken
}

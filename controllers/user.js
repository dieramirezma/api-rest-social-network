import User from '../models/user.js'
import bcrypt from 'bcrypt'
import { createToken } from '../services/jwt.js'

// Test actions
export const testUser = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller user.js'
  })
}

// Users registration
export const register = async (req, res) => {
  try {
    const params = req.body

    // Check required fields
    if (!params.name || !params.lastname || !params.email || !params.password || !params.nick) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      })
    }

    // Create an instance of the user model
    const userToSave = new User(params)

    // Check if the user already exists
    const foundUser = await User.findOne({
      $or: [
        { email: userToSave.email.toLowerCase() },
        { nick: userToSave.nick.toLowerCase() }
      ]
    })

    // If the user already exists, return an error
    if (foundUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists'
      })
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(userToSave.password, salt)
    userToSave.password = hashedPassword

    // Save user
    await userToSave.save()

    // Return response
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: userToSave
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the user registration process'
    })
  }
}

// Authenticate users method
export const login = async (req, res) => {
  try {
    const params = req.body

    // Check required fields
    if (!params.email || !params.password) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      })
    }

    // Find user by email
    const user = await User.findOne({ email: params.email.toLowerCase() })

    // If the user does not exist, return an error
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      })
    }

    // Check password
    const validPassword = await bcrypt.compare(params.password, user.password)

    // If the password is incorrect, return an error
    if (!validPassword) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect password'
      })
    }

    // Generate token
    const token = createToken(user)

    // Return response
    return res.status(200).json({
      status: 'success',
      messagge: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        nick: user.nick,
        role: user.role,
        image: user.image,
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error in the login process'
    })
  }
}

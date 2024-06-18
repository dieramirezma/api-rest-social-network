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
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        lastname: user.lastname,
        bio: user.bio,
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

// Show user profile method
export const profile = async (req, res) => {
  try {
    // Get user id from params of the URL
    const userId = req.params.id

    // Find user in the DB, excluding role and version
    const user = await User.findById(userId).select('-password -role -__v')

    // Check if user exists
    if (!user) {
      return res.status(404).send({
        status: 'error',
        message: 'User not found'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Profile information obtained successfully',
      user
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 'error',
      message: 'Error to get the profile information'
    })
  }
}

// List user with pagination method
export const listUsers = async (req, res) => {
  try {
    // Control pagination
    const page = req.params.page ? parseInt(req.params.page, 10) : 1
    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    // Consult the DB with pagination
    const options = {
      page,
      limit: itemsPerPage,
      select: '--password --role --__v'
    }

    const users = await User.paginate({}, options)

    if (!users || users.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'No users available'
      })
    }

    return res.status(200).json({
      status: 'success',
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      page: users.page,
      pagingCounter: users.pagingCounter,
      hasPrevPage: users.hasPrevPage,
      hasNextPage: users.hasNextPage,
      prevPage: users.prevPage,
      nextPage: users.nextPage
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to get the list of users'
    })
  }
}

// Update user profile method
export const updateUser = async (req, res) => {
  try {
    // Get data from the request body
    const userIdentity = req.user
    const userToUpdate = req.body

    if (!userToUpdate.email || !userToUpdate.nick) {
      return res.status(400).send({
        status: 'error',
        message: 'Missing required fields: email, nick'
      })
    }

    // Delete properties that should not be updated
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    delete userToUpdate.image

    // Check if user exists
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() },
        { nick: userToUpdate.nick.toLowerCase() }
      ]
    }).exec()

    const isDuplicateUser = users.some(user => user && user._id.toString() !== userIdentity.userId)

    if (isDuplicateUser) {
      return res.status(409).send({
        status: 'error',
        message: 'Only one user can have the same email or nick'
      })
    }

    // Encrypt password
    if (userToUpdate.password) {
      try {
        const salt = await bcrypt.genSalt(10)
        const pwd = await bcrypt.hash(userToUpdate.password, salt)
        userToUpdate.password = pwd
      } catch (error) {
        console.log(error)
        return res.status(500).send({
          status: 'error',
          message: 'Error to encrypt the password'
        })
      }
    } else {
      delete userToUpdate.password
    }

    // Update user
    const userUpdated = await User.findByIdAndUpdate(userIdentity.userId, userToUpdate, { new: true })

    if (!userUpdated) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to update the user profile'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'User profile updated successfully',
      user: userUpdated
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to update the user profile'
    })
  }
}

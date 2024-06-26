import User from '../models/user.js'
import bcrypt from 'bcrypt'
import { createToken } from '../services/jwt.js'
import fs from 'fs'
import path from 'path'
import { followThisUser, followUserIds } from '../services/followService.js'
import Follow from '../models/follow.js'
import Publication from '../models/publications.js'

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

    // Verify if the auth user ID exists
    if (!req.user || !req.user.userId) {
      return res.status(400).send({
        status: 'error',
        message: 'User not identified'
      })
    }

    // Find user in the DB, excluding role and version
    const userProfile = await User.findById(userId).select('-password -role -__v')

    // Check if user exists
    if (!userProfile) {
      return res.status(404).send({
        status: 'error',
        message: 'User not found'
      })
    }

    // Get user data
    const followInfo = await followThisUser(req.user.userId, userId)

    return res.status(200).json({
      status: 'success',
      message: 'Profile information obtained successfully',
      user: userProfile,
      followInfo
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
    // List of followers
    const followUsers = await followUserIds(req)

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
      nextPage: users.nextPage,
      usersFollowing: followUsers.following,
      userFollowMe: followUsers.followers
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

// Upload user image method
export const uploadFiles = async (req, res) => {
  try {
    // Get file from request and check if it exists
    if (!req.file) {
      return res.status(400).send({
        status: 'error',
        message: 'No files were uploaded'
      })
    }

    const image = req.file.originalname

    // Get file extension
    const extension = image.split('.').pop()
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif']

    if (!validExtensions.includes(extension.toLowerCase())) {
      const filePath = req.file.path
      fs.unlinkSync(filePath)

      return res.status(400).send({
        status: 'error',
        message: 'Invalid file extension. Only extensions: ' + validExtensions.join(', ')
      })
    }

    // Validate file size
    const fileSize = req.file.size
    const maxFileSize = 2 * 1024 * 1024

    if (fileSize > maxFileSize) {
      const filePath = req.file.path
      fs.unlinkSync(filePath)

      return res.status(400).send({
        status: 'error',
        message: 'File size exceeded. Max file size: 2MB'
      })
    }

    const userUpdated = await User.findByIdAndUpdate(
      { _id: req.user.userId },
      { image: req.file.filename },
      { new: true }
    )
    if (!userUpdated) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to update the user image'
      })
    }

    return res.status(200).json({
      status: 'success',
      message: 'Files uploaded successfully',
      user: req.user,
      file: req.file
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to upload files'
    })
  }
}

// Show user image method
export const avatar = async (req, res) => {
  try {
    // Get file from request
    const file = req.params.file

    // Get file path and check if it exists
    const filePath = `./uploads/avatars/${file}`
    fs.stat(filePath, (error, exists) => {
      if (!exists || error) {
        return res.status(404).send({
          status: 'error',
          message: 'File not found'
        })
      }

      return res.sendFile(path.resolve(filePath))
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to get the user image'
    })
  }
}

// Show followers count method
export const countFollowers = async (req, res) => {
  try {
    // Get user id from token
    const userId = req.params.id ? req.params.id : req.user.userId

    // Find user in the DB and get name and last name
    const user = await User.findById(userId, { name: 1, lastname: 1 })

    if (!user) {
      return res.status(404).send({
        status: 'error',
        message: 'User not found'
      })
    }

    // Count number of following
    const followingCount = await Follow.countDocuments({ following_user: userId })

    // Count number of followers
    const followedCount = await Follow.countDocuments({ followed_user: userId })

    // Count number of publications
    const publicationCount = await Publication.countDocuments({ user_id: userId })

    return res.status(200).json({
      status: 'success',
      message: 'Followers count obtained successfully',
      userId,
      name: user.name,
      lastname: user.lastname,
      following: followingCount,
      followed: followedCount,
      publications: publicationCount
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to get the followers count'
    })
  }
}

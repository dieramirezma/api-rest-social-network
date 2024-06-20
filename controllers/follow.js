import Follow from '../models/follow.js'
import User from '../models/user.js'

// Test actions
export const testFollow = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller follow.js'
  })
}

// Save follow user
export const saveFollow = async (req, res) => {
  try {
    // Get data from the request
    const { followed_user } = req.body

    // Get the auth user ID from the token
    const identity = req.user

    // Check if 'identity' contains the auth user ID
    if (!identity || !identity.userId) {
      return res.status(400).send({
        status: 'error',
        message: 'User not identified'
      })
    }

    // Check if user trying to follow himself
    if (identity.userId === followed_user) {
      return res.status(400).send({
        status: 'error',
        message: 'You cannot follow yourself'
      })
    }

    // Check if the user to follow exists
    const userFollowed = await User.findById(followed_user)

    if (!userFollowed) {
      return res.status(404).send({
        status: 'error',
        message: 'User to follow does not exist'
      })
    }

    // Check if the follow already exists
    const existingFollow = await Follow.findOne({
      following_user: identity.userId,
      followed_user
    })

    if (existingFollow) {
      return res.status(400).send({
        status: 'error',
        message: 'You are already following this user'
      })
    }

    // Create the follow object
    const newFollow = new Follow({
      following_user: identity.userId,
      followed_user
    })

    // Save the follow in the database
    const followSaved = await newFollow.save()

    if (!followSaved) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to follow user'
      })
    }

    // Get the name and last name of the followed user
    const followedUserDetails = await User.findById(followed_user).select('name lastname')

    if (!followedUserDetails) {
      return res.status(400).send({
        status: 'error',
        message: 'User to follow does not exist'
      })
    }

    // Merge follow details and followedUserDetails
    const followDetails = {
      ...followSaved.toObject(),
      followedUser: {
        name: followedUserDetails.name,
        lastname: followedUserDetails.lastname
      }
    }

    return res.status(200).json({
      status: 'success',
      message: 'User followed successfully',
      identity: req.user,
      follow: followDetails
    })
  } catch (error) {
    if (error.code === 11000) { // Duplicate key code error
      return res.status(400).send({
        status: 'error',
        message: 'You are already following this user'
      })
    }
    return res.status(500).send({
      status: 'error',
      message: 'Error to follow user'
    })
  }
}

// Delete follow user

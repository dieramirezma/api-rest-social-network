import Follow from '../models/follow.js'

// Get an array of user IDs that the user follows and that follow the user
export const followUserIds = async (req, res) => {
  try {
    const identityUserId = req.user.userId

    if (!identityUserId) {
      return res.status(400).send({
        status: 'error',
        message: 'User not identified'
      })
    }

    const following = await Follow.find({ following_user: identityUserId })
      .select({ followed_user: 1, _id: 0 })
      .exec()

    const followers = await Follow.find({ followed_user: identityUserId })
      .select({ following_user: 1, _id: 0 })
      .exec()

    const userFollowing = following.map(follow => follow.followed_user)
    const userFollowMe = followers.map(follow => follow.following_user)

    return {
      following: userFollowing,
      followers: userFollowMe
    }
  } catch (error) {
    return {
      following: [],
      followers: []
    }
  }
}

// Get data from one user that follow me or I follow
export const followThisUser = async (identityUserId, profileUserId) => {
  try {
    // Check if the IDs are valid
    if (!identityUserId || !profileUserId) throw new Error('User IDs are required')

    // Verify if I follow the
    const following = await Follow.findOne({ following_user: identityUserId, followed_user: profileUserId })

    // Verify if the user follows me
    const followed = await Follow.findOne({ following_user: profileUserId, followed_user: identityUserId })

    return {
      following,
      followed
    }
  } catch (error) {
    console.log('Error to get follow data: ', error)
    return {
      following: null,
      followed: null
    }
  }
}

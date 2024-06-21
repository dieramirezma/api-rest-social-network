import Follow from '../models/follow.js'

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

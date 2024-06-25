import mongoose from 'mongoose'

// Middleware to check if entity exists
export const checkEntityExists = (model, ownerIdField = 'id') => {
  return async (req, res, next) => {
    try {
      let entityId

      // Check if ownerIdField is 'id' or 'user_id'
      if (ownerIdField === 'id') {
        entityId = req.params.id
      } else if (ownerIdField === 'user_id') {
        entityId = req.user.userId
      } else {
        return res.status(400).send({
          status: 'error',
          message: `ID field ${ownerIdField} is not valid`
        })
      }

      // Check if the ID is a valid mongoose ID
      if (!mongoose.Types.ObjectId.isValid(entityId)) {
        return res.status(400).send({
          status: 'error',
          message: 'Invalid ID'
        })
      }

      const entityExists = await model.findById(entityId)

      if (!entityExists) {
        return res.status(400).send({
          status: 'error',
          message: `Entity not found with the provided ID: ${entityId} in the model: ${model.modelName}`
        })
      }

      req.entity = entityExists

      next()
    } catch (error) {
      return res.status(500).send({
        status: 'error',
        message: 'Error checking entity existence',
        error: error.message
      })
    }
  }
}

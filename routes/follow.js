// Imports
import { Router } from 'express'
import { testFollow } from '../controllers/follow.js'

const router = Router()

// Routes
router.get('/test-follow', testFollow)

// Export
export default router

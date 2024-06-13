// Imports
import { Router } from 'express'
import { testUser } from '../controllers/user.js'

const router = Router()

// Routes
router.get('/test-user', testUser)

// Export
export default router

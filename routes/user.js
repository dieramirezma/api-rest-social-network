// Imports
import { Router } from 'express'
import { testUser, register } from '../controllers/user.js'

const router = Router()

// Routes
router.get('/test-user', testUser)
router.post('/register', register)

// Export
export default router

// Imports
import { Router } from 'express'
import { testUser, register, login } from '../controllers/user.js'
import { ensureAuth } from '../middleware/auth.js'

const router = Router()

// Routes
router.get('/test-user', ensureAuth, testUser)
router.post('/register', register)
router.post('/login', login)

// Export
export default router

// Imports
import { Router } from 'express'
import { testUser, register, login, profile, listUsers } from '../controllers/user.js'
import { ensureAuth } from '../middleware/auth.js'

const router = Router()

// Routes
router.get('/test-user', ensureAuth, testUser)
router.post('/register', register)
router.post('/login', login)
router.get('/profile/:id', ensureAuth, profile)
router.get('/list/:page?', ensureAuth, listUsers)

// Export
export default router

// Imports
import { Router } from 'express'
import { saveFollow, testFollow } from '../controllers/follow.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/test-follow', testFollow)
router.post('/follow', ensureAuth, saveFollow)

// Export
export default router

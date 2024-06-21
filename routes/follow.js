// Imports
import { Router } from 'express'
import { saveFollow, testFollow, unfollow } from '../controllers/follow.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/test-follow', testFollow)
router.post('/follow', ensureAuth, saveFollow)
router.delete('/unfollow/:id', ensureAuth, unfollow)

// Export
export default router

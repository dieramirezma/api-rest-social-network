// Imports
import { Router } from 'express'
import { following, saveFollow, testFollow, unfollow } from '../controllers/follow.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/test-follow', testFollow)
router.post('/follow', ensureAuth, saveFollow)
router.delete('/unfollow/:id', ensureAuth, unfollow)
router.get('/following/:id?/:page?', ensureAuth, following)

// Export
export default router

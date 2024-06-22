// Imports
import { Router } from 'express'
import { savePublication, testPublications } from '../controllers/publications.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/test-publications', testPublications)
router.post('/publication', ensureAuth, savePublication)

// Export
export default router

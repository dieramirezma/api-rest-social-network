// Imports
import { Router } from 'express'
import { savePublication, showPublication, testPublications } from '../controllers/publications.js'
import { ensureAuth } from '../middlewares/auth.js'

const router = Router()

// Routes
router.get('/test-publications', testPublications)
router.post('/publication', ensureAuth, savePublication)
router.get('/show-publication/:id', ensureAuth, showPublication)

// Export
export default router

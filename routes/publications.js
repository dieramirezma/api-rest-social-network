// Imports
import { Router } from 'express'
import { testPublications } from '../controllers/publications.js'

const router = Router()

// Routes
router.get('/test-publications', testPublications)

// Export
export default router

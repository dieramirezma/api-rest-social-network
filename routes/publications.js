// Imports
import { Router } from 'express'
import { deletePublication, listPublicationsUser, savePublication, showMedia, showPublication, testPublications, uploadFiles } from '../controllers/publications.js'
import { ensureAuth } from '../middlewares/auth.js'
import multer from 'multer'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/publications/')
  },
  filename: (req, file, cb) => {
    cb(null, 'pub-' + Date.now() + '-' + file.originalname)
  }
})

// Middleware for uploads
const uploads = multer({ storage })

// Routes
router.get('/test-publications', testPublications)
router.post('/publication', ensureAuth, savePublication)
router.get('/show-publication/:id', ensureAuth, showPublication)
router.delete('/delete-publication/:id', ensureAuth, deletePublication)
router.get('/publications-user/:id/:pag?', ensureAuth, listPublicationsUser)
router.post('/upload-media/:id', [ensureAuth, uploads.single('file0')], uploadFiles)
router.get('/show-media/:file', showMedia)

// Export
export default router

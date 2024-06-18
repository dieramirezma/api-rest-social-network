// Imports
import { Router } from 'express'
import { testUser, register, login, profile, listUsers, updateUser, uploadFiles } from '../controllers/user.js'
import { ensureAuth } from '../middlewares/auth.js'
import multer from 'multer'

const router = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/avatars/')
  },
  filename: (req, file, cb) => {
    cb(null, 'avatar-' + Date.now() + '-' + file.originalname)
  }
})

// Middleware for uploads
const uploads = multer({ storage })

// Routes
router.get('/test-user', ensureAuth, testUser)
router.post('/register', register)
router.post('/login', login)
router.get('/profile/:id', ensureAuth, profile)
router.get('/list/:page?', ensureAuth, listUsers)
router.put('/update', ensureAuth, updateUser)
router.post('/upload', [ensureAuth, uploads.single('file0')], uploadFiles)

// Export
export default router

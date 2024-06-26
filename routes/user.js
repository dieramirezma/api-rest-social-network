// Imports
import { Router } from 'express'
import { testUser, register, login, profile, listUsers, updateUser, uploadFiles, avatar, countFollowers } from '../controllers/user.js'
import { ensureAuth } from '../middlewares/auth.js'
import multer from 'multer'
import { checkEntityExists } from '../middlewares/checkEntityExists.js'
import User from '../models/user.js'

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
router.post('/upload', [ensureAuth, checkEntityExists(User, 'user_id'), uploads.single('file0')], uploadFiles)
router.get('/avatar/:file', avatar)
router.get('/counters/:id?', ensureAuth, countFollowers)

// Export
export default router

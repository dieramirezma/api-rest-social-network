// Imports
import connection from './database/connection.js'
import express from 'express'
import cors from 'cors'
import UserRoutes from './routes/user.js'
import PublicationsRoutes from './routes/publications.js'
import FollowRoutes from './routes/follow.js'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

console.log('API running...')

// DB connection
console.log('Trying to connect to the database...')
connection()

dotenv.config()

// Create node server
const app = express()
const port = process.env.PORT || 3900

// Config CORS
app.use(cors({
  origin: '*', // Permitir solicitudes desde cualquier origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  preflightContinue: false,
  optionsSuccessStatus: 204
}))

// Parse JSON
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Routes config
app.use('/api/user', UserRoutes)
app.use('/api/publication', PublicationsRoutes)
app.use('/api/follow', FollowRoutes)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Configuration to serve static files (avatar images)
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')))

// CConfiguration to serve static files (publication images)
app.use('/uploads/publications', express.static(path.join(__dirname, 'uploads', 'publications')))

// Server config to listen on port
app.listen(port, () => {
  console.log(`Server running on port ${port}...`)
})

export default app

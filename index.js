// Imports
import connection from './database/conection.js'
import express, { json, urlencoded } from 'express'
import cors from 'cors'

console.log('API running...')

// DB conection
console.log('Trying to connect to the database...')
connection()

// Create node server
const app = express()
const port = 3900

// Config CORS
app.use(cors())

// Parse JSON
app.use(json())
app.use(urlencoded({ extended: true }))

// Routes config
app.get('/test-route', (req, res) => {
  return res.status(200).json(
    {
      id: 1,
      name: 'Diego Ramirez',
      username: 'dieramirezma'
    }
  )
})

// Server config to listen on port
app.listen(port, () => {
  console.log(`Server running on port ${port}...`)
})

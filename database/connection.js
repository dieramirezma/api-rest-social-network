import { connect } from 'mongoose'

const connection = async () => {
  try {
    await connect('mongodb://localhost:27017/db_social_network')
    console.log('Connected to the database')
  } catch (error) {
    console.log(error)
    throw new Error('Error connecting to the database')
  }
}

export default connection

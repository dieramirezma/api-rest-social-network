import { Schema, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

const PublicationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  file: String,
  created_at: {
    type: Date,
    default: Date.now
  }
})

PublicationSchema.plugin(mongoosePaginate)

export default model('Publication', PublicationSchema, 'publications')

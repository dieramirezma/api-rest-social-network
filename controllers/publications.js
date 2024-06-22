import Publication from '../models/publications.js'

// Test actions
export const testPublications = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller publications.js'
  })
}

// Create publication method
export const savePublication = async (req, res) => {
  try {
    // Get the data from the request
    const params = req.body

    // Check if the publication has a text
    if (!params.text) {
      return res.status(400).send({
        status: 'error',
        message: 'The publication must have a text'
      })
    }

    // Create the publication object
    const publication = new Publication(params)

    // Assign the user id to the publication
    publication.user_id = req.user.userId

    // Save the publication in the DB
    const publicationStored = await publication.save()

    if (!publicationStored) {
      return res.status(500).send({
        status: 'error',
        message: 'Error saving publication'
      }
      )
    }
    return res.status(200).send({
      status: 'success',
      message: 'Publication saved successfully',
      publication: publicationStored
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error saving publication'
    })
  }
}

// Show publication
export const showPublication = async (req, res) => {
  try {
    // Get the id from the URL
    const { id } = req.params

    // Check if the id is valid
    if (!id) {
      return res.status(404).send({
        status: 'error',
        message: 'Publication not found'
      })
    }

    // Find the publication in the DB
    const publication = await Publication.findById(id)
      .populate('user_id', 'name lastname -_id')
      .select('-__v')

    if (!publication) {
      return res.status(404).send({
        status: 'error',
        message: 'Publication not found'
      })
    }

    return res.status(200).send({
      status: 'success',
      message: 'Publication showed successfully',
      publication
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error showing publication'
    })
  }
}

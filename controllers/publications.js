import Publication from '../models/publications.js'
import fs from 'fs'
import path from 'path'
import { followUserIds } from '../services/followService.js'

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

// Delete publication method
export const deletePublication = async (req, res) => {
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

    // Find and delete the publication in the DB
    const publicationDeleted = await Publication.findOneAndDelete({
      _id: id,
      user_id: req.user.userId
    })
      .populate('user_id', 'name lastname')

    //  Check if the publication was deleted
    if (!publicationDeleted) {
      return res.status(400).send({
        status: 'error',
        message: 'Publication not found or already deleted'
      })
    }

    return res.status(200).send({
      status: 'success',
      message: 'Publication deleted successfully',
      publication: publicationDeleted
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error deleting publication'
    })
  }
}

// List publications method
export const listPublicationsUser = async (req, res) => {
  try {
    // Get the user id from the URL
    const { id } = req.params

    const page = req.params.pag ? parseInt(req.params.pag, 10) : 1

    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    // Config the options for the pagination
    const options = {
      page,
      limit: itemsPerPage,
      sort: { created_at: 'desc' },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true
    }

    // Find publications in the DB and populate the users
    const publications = await Publication.paginate({ user_id: id }, options)

    if (!publications.docs || publications.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'Publications not found'
      })
    }

    return res.status(200).send({
      status: 'success',
      message: 'Publication list showed successfully',
      publications: publications.docs,
      total: publications.totalDocs,
      pages: publications.totalPages,
      page: publications.page,
      limit: publications.limit
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error showing publication list'
    })
  }
}

// Upload files to the publication method
export const uploadFiles = async (req, res) => {
  try {
    // Get the publication id from the URL
    const { id } = req.params

    if (id.length !== 24) {
      const filePath = req.file.path
      fs.unlinkSync(filePath)
      return res.status(400).send({
        status: 'error',
        message: 'Invalid publication id'
      })
    }

    // Get file from request and check if it exists
    if (!req.file) {
      return res.status(404).send({
        status: 'error',
        message: 'No files were uploaded'
      })
    }

    const file = req.file.originalname

    // Get file extension
    const extension = file.split('.').pop()
    const validExtensions = ['png', 'jpg', 'jpeg', 'gif', 'mp4']

    if (!validExtensions.includes(extension.toLowerCase())) {
      const filePath = req.file.path
      fs.unlinkSync(filePath)

      return res.status(400).send({
        status: 'error',
        message: 'Invalid file extension. Only extensions: ' + validExtensions.join(', ')
      })
    }

    // Validate file size
    const fileSize = req.file.size
    const maxFileSize = 1 * 1024 * 1024

    if (fileSize > maxFileSize) {
      const filePath = req.file.path
      fs.unlinkSync(filePath)

      return res.status(400).send({
        status: 'error',
        message: 'File size exceeded. Max file size: 1MB'
      })
    }

    // Update the publication file
    const publicationUpdated = await Publication.findOneAndUpdate(
      { user_id: req.user.userId, _id: id },
      { file: req.file.filename },
      { new: true }
    )
    if (!publicationUpdated) {
      return res.status(400).send({
        status: 'error',
        message: 'Error to update the publication file'
      })
    }

    return res.status(200).send({
      status: 'success',
      message: 'File uploaded successfully',
      publication: publicationUpdated,
      file: req.file
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to upload files'
    })
  }
}

// Show media publication method
export const showMedia = async (req, res) => {
  try {
    // Get file from request
    const file = req.params.file

    // Get file path and check if it exists
    const filePath = `./uploads/publications/${file}`
    fs.stat(filePath, (error, exists) => {
      if (!exists || error) {
        return res.status(404).send({
          status: 'error',
          message: 'File not found'
        })
      }

      return res.sendFile(path.resolve(filePath))
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error to show the publication media'
    })
  }
}

// List publications (Feed) method
export const feed = async (req, res) => {
  try {
    const page = req.params.page ? parseInt(req.params.page, 10) : 1

    const itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5

    // Check if authenticated user exists
    if (!req.user || !req.user.userId) {
      return res.status(404).send({
        status: 'error',
        message: 'User not authenticated'
      })
    }

    // Get the users that the authenticated user follows
    const myFollows = await followUserIds(req)
    console.log(myFollows)
    // Check if the list of follows is empty
    if (!myFollows.following || !myFollows.following.length === 0) {
      return res.status(400).send({
        status: 'error',
        message: 'You are not following any user. No publications to show'
      })
    }

    // Config the options for the pagination
    const options = {
      page,
      limit: itemsPerPage,
      sort: { created_at: 'desc' },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true
    }

    // Find publications in the DB and populate the users
    const publications = await Publication.paginate(
      { user_id: { $in: myFollows.following } },
      options
    )

    if (!publications.docs || publications.docs.length === 0) {
      return res.status(404).send({
        status: 'error',
        message: 'Publications not found'
      })
    }

    return res.status(200).send({
      status: 'success',
      message: 'Feed publications showed successfully',
      publications: publications.docs,
      total: publications.totalDocs,
      pages: publications.totalPages,
      page: publications.page,
      limit: publications.limit
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      status: 'error',
      message: 'Error showing feed publications'
    })
  }
}

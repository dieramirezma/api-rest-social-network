// Test actions
export const testPublications = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller publications.js'
  })
}

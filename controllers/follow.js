// Test actions
export const testFollow = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller follow.js'
  })
}

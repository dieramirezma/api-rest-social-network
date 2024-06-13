// Test actions
export const testUser = (req, res) => {
  return res.status(200).send({
    message: 'Message sent from the controller user.js'
  })
}

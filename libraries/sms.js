const twillio = require('twilio')(process.env.TWILLIO_ACCOUNT_SID, process.env.TWILLIO_AUTH_TOKEN)

class SMS {
  doSend (phoneNumber, message) {
    return twillio.messages.create({
      body: message,
      messagingServiceSid: process.env.TWILLIO_MESSAGING_SID,
      to: `+1${phoneNumber}`
    })
  }
}

module.exports = SMS

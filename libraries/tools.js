const tools = {
  regexp: {
    /**
     * Remove all phone codes and special characters from a phone number
     * @param formattedPhoneNumber | String - +1 (123) 456-7890
     */
    doCleanPhoneNumber (formattedPhoneNumber) {
      if (formattedPhoneNumber === undefined || formattedPhoneNumber === null) return String()

      let phoneNumber = formattedPhoneNumber.toString().replace(/\D/g, '')

      if (phoneNumber[0] === '1') phoneNumber = phoneNumber.slice(1)

      return phoneNumber
    },
    /**
     * Removes all characters that are not numbers (0-9)
     * @param string | String a string filled with characters and numbers
     */
    doRemoveAllExceptNumbers (string) {
      if (string === undefined || string === null) return String()

      return string.toString().replace(/\D/g, '')
    }
  }
}

module.exports = tools

var crypto = require('crypto');

const IV_LENGTH = 16;
const ENCRYPTION_KEY = 'Writing objects: 100% (5/5), 600';

exports.encrypt = function (text) {
    // console.log('encrypt:' + text)
    let iv = crypto.randomBytes(IV_LENGTH)
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let encrypted = cipher.update(text)

    encrypted = Buffer.concat([encrypted, cipher.final()])

    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

exports.decrypt = function (text) {
    // console.log('decrypt:' + text)
    let textParts = text.split(':')
    let iv = Buffer.from(textParts.shift(), 'hex')
    let encryptedText = Buffer.from(textParts.join(':'), 'hex')
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv)
    let decrypted = decipher.update(encryptedText)

    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString()
}
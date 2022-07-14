// oath-creator.js

require("dotenv").config()
const crypto = require("crypto")
const OAuth = require("oauth-1.0a")
 

function Oath(config = {}) {
    let consumerKey = config.consumerKey
    let consumerSecret = config.consumerSecret
    let tokenKey = config.tokenKey
    let tokenSecret = config.tokenSecret
    let requestData = config.requestData

    let token = {
        key: tokenKey,
        secret: tokenSecret
    }

    const oauth = OAuth({
        consumer: {
            key: consumerKey,
            secret: consumerSecret
        },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto
            .createHmac('sha1', key)
            .update(base_string)
            .digest('base64')
        }
    })

    this.create = function(requestData) {
        return oauth.authorize(requestData)
    }

}



module.exports = Oath
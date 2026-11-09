const crypto = require ('crypto')

//hash a password => "salt:hash"
const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString("hex")
    const hash = crypto.scryptSync(password, salt, 64).toString("hex")
    return `${salt}:${hash}`
}

//compare a plain password with the saved "salt:hash"
const verifyPassword = (password, saved) => {
    const [salt, hash] = (saved || "").split(":")
    if(!salt || !hash) return false
    const check = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(check, Buffer.from(hash, "hex"))
}

module.exports = { hashPassword, verifyPassword }

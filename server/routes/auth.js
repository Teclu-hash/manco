const express = require ('express')
const router = express.Router()

const {User} = require ('../models')
const {verifyPassword, hashPassword} = require ('../utils/password')

//login
router.post("/login", async (req, res) => {
    const {username, password} = req.body
    try{
        const found = await User.findOne({
            where: {username: username}
        })
        if(!found || !verifyPassword(password || "", found.password)){
            return res.status(401).json({message: "Invalid username or password"})
        }
        res.status(200).json({
            user_id: found.user_id,
            username: found.username,
            role: found.role
        })
    }catch(error) {
        res.status(500).json({message: "An error occurred while logging in"})
    }
})


// Public student registration. The role is fixed on the server and cannot be chosen by the client.
router.post("/register", async (req, res) => {
    const {username, password} = req.body
    if(!username || !password || String(username).trim().length < 3 || String(password).length < 6){
        return res.status(400).json({message: "Username must be at least 3 characters and password at least 6 characters"})
    }
    try{
        const existing = await User.findOne({where: {username: String(username).trim()}})
        if(existing) return res.status(409).json({message: "Username is already taken"})
        const user = await User.create({
            username: String(username).trim(),
            password: hashPassword(password),
            role: "Student"
        })
        res.status(201).json({user_id: user.user_id, username: user.username, role: user.role})
    }catch(error) {
        res.status(500).json({message: "An error occurred while registering"})
    }
})

//last line
module.exports = router

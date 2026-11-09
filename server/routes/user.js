const express = require ('express')
const router = express.Router()

const {User} = require ('../models')
const {hashPassword} = require ('../utils/password')

//get request => list of users
router.get("/", async (req, res) => {
    try{
        const list = await User.findAll({
            attributes: ["user_id","username","role"]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching users"})
    }
})

//get user details using user_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await User.findAll({
            attributes: ["user_id","username","role"],
            where: {user_id: id}
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching user"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {username, password, role} = req.body
    try{
        await User.create({
            username,
            password: hashPassword(password),
            role
        })
        res.status(201).json({message: "Successfully created user"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new user"})
    }
})

//update user data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {username, password, role} = req.body

    try{
        const result = await User.update(
            {
                username: username,
                password: password ? hashPassword(password) : undefined,
                role: role
            },
            {
                where: {user_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "User data not found!"})
        }
        res.status(200).json({message: "Successfully updated user data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating user data"})
    }
})

//delete user
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await User.destroy({
            where: {user_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "User data not found!"})
        }
        res.status(200).json({message: "Successfully deleted user"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting user"})
    }
})

//last line
module.exports = router

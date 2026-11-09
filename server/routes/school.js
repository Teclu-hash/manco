const express = require ('express')
const router = express.Router()

const {School} = require ('../models')

//get request => list of schools
router.get("/", async (req, res) => {
    try{
        const list = await School.findAll({
            attributes: ["school_id","school_name","address"]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching schools"})
    }
})

//get school details using school_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await School.findAll({
            attributes: ["school_id","school_name","address"],
            where: {school_id: id}
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching school"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {school_name, address} = req.body
    try{
        await School.create({
            school_name,
            address
        })
        res.status(201).json({message: "Successfully created school"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new school"})
    }
})

//update school data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {school_name, address} = req.body

    try{
        const result = await School.update(
            {
                school_name: school_name,
                address: address
            },
            {
                where: {school_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "School data not found!"})
        }
        res.status(200).json({message: "Successfully updated school data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating school data"})
    }
})

//delete school
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await School.destroy({
            where: {school_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "School data not found!"})
        }
        res.status(200).json({message: "Successfully deleted school"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting school"})
    }
})

//last line
module.exports = router

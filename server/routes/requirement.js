const express = require ('express')
const router = express.Router()

const {Requirement} = require ('../models')

//get request => list of requirements
router.get("/", async (req, res) => {
    try{
        const list = await Requirement.findAll({
            attributes: ["requirement_id","requirement_name","description","deadline"]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching requirements"})
    }
})

//get requirement details using requirement_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await Requirement.findAll({
            attributes: ["requirement_id","requirement_name","description","deadline"],
            where: {requirement_id: id}
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching requirement"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {requirement_name, description, deadline} = req.body
    try{
        await Requirement.create({
            requirement_name,
            description,
            deadline: deadline || null
        })
        res.status(201).json({message: "Successfully created requirement"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new requirement"})
    }
})

//update requirement data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {requirement_name, description, deadline} = req.body

    try{
        const result = await Requirement.update(
            {
                requirement_name: requirement_name,
                description: description,
                deadline: deadline || null
            },
            {
                where: {requirement_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "Requirement data not found!"})
        }
        res.status(200).json({message: "Successfully updated requirement data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating requirement data"})
    }
})

//delete requirement
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await Requirement.destroy({
            where: {requirement_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "Requirement data not found!"})
        }
        res.status(200).json({message: "Successfully deleted requirement"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting requirement"})
    }
})

//last line
module.exports = router

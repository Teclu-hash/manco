const express = require ('express')
const router = express.Router()

const {ApplicationRequirement, Application, Requirement} = require ('../models')

//get request => list of application requirements
router.get("/", async (req, res) => {
    //optional filter => /api/application-requirement?application_id=1
    const {application_id} = req.query
    try{
        const list = await ApplicationRequirement.findAll({
            where: application_id ? {application_id: application_id} : {},
            attributes: ["app_requirement_id","application_id","requirement_id","submission_status","date_submitted"],
            include: [
                {
                    model: Application,
                    attributes: ["application_number"]
                },
                {
                    model: Requirement,
                    attributes: ["requirement_name"]
                }
            ]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching application requirements"})
    }
})

//get application requirement details using app_requirement_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await ApplicationRequirement.findAll({
            attributes: ["app_requirement_id","application_id","requirement_id","submission_status","date_submitted"],
            where: {app_requirement_id: id},
            include: [
                {
                    model: Application,
                    attributes: ["application_number"]
                },
                {
                    model: Requirement,
                    attributes: ["requirement_name"]
                }
            ]
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching application requirement"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {application_id, requirement_id, submission_status, date_submitted} = req.body
    try{
        await ApplicationRequirement.create({
            application_id,
            requirement_id,
            submission_status,
            date_submitted
        })
        res.status(201).json({message: "Successfully created application requirement"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new application requirement"})
    }
})

//update application requirement data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {application_id, requirement_id, submission_status, date_submitted} = req.body

    try{
        const result = await ApplicationRequirement.update(
            {
                application_id: application_id,
                requirement_id: requirement_id,
                submission_status: submission_status,
                date_submitted: date_submitted
            },
            {
                where: {app_requirement_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "Application requirement data not found!"})
        }
        res.status(200).json({message: "Successfully updated application requirement data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating application requirement data"})
    }
})

//delete application requirement
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await ApplicationRequirement.destroy({
            where: {app_requirement_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "Application requirement data not found!"})
        }
        res.status(200).json({message: "Successfully deleted application requirement"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting application requirement"})
    }
})

//last line
module.exports = router

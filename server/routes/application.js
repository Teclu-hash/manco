const express = require ('express')
const router = express.Router()

const {Application, Student, User, School, Requirement, ApplicationRequirement, StudentSubmission} = require ('../models')

//get request => list of applications
router.get("/", async (req, res) => {
    try{
        // Backfill application rows for student accounts that uploaded requirements
        // before automatic application creation was introduced.
        const priorSubmissions = await StudentSubmission.findAll({
            attributes: ['user_id'],
            group: ['user_id'],
            raw: true
        })
        for (const row of priorSubmissions) {
            const existing = await Application.findOne({ where: { user_id: row.user_id } })
            if (!existing) {
                const year = new Date().getFullYear()
                const lastId = await Application.max('application_id') || 0
                await Application.create({
                    user_id: row.user_id,
                    student_id: null,
                    application_number: String(lastId + 1),
                    academic_year: `${year}-${year + 1}`,
                    date_applied: new Date().toISOString().slice(0, 10),
                    status: 'Pending'
                })
            }
        }

        const list = await Application.findAll({
            attributes: ["application_id","student_id","user_id","application_number","academic_year","date_applied","status"],
            order: [["application_id", "DESC"]],
            include: [
                {
                    model: Student,
                    attributes: ["student_name"],
                    include: {
                        model: School,
                        attributes: ["school_name"]
                    }
                },
                {
                    model: User,
                    attributes: ["username"]
                }
            ]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching applications"})
    }
})

//get application details using application_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await Application.findAll({
            attributes: ["application_id","student_id","user_id","application_number","academic_year","date_applied","status"],
            where: {application_id: id},
            include: [
                {
                    model: Student,
                    attributes: ["student_name","course","year_level","contact_number"],
                    include: {
                        model: School,
                        attributes: ["school_name"]
                    }
                },
                {
                    model: User,
                    attributes: ["username"]
                }
            ]
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching application"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {student_id, user_id, academic_year, date_applied, status} = req.body
    try{
        //Application numbers are simple sequential values: 1, 2, 3, ...
        const last = await Application.max("application_id") || 0
        const year = new Date().getFullYear()
        const application_number = String(last + 1)

        const application = await Application.create({
            student_id,
            user_id,
            application_number,
            academic_year,
            date_applied,
            status: status || "Pending"
        })

        //every requirement starts as pending for the new application
        const requirements = await Requirement.findAll({attributes: ["requirement_id"]})
        await ApplicationRequirement.bulkCreate(
            requirements.map((r) => ({
                application_id: application.application_id,
                requirement_id: r.requirement_id,
                submission_status: "Pending"
            }))
        )

        res.status(201).json({message: "Successfully created application"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new application"})
    }
})

//accept or deny an application without changing its other fields
router.patch("/:id/decision", async (req, res) => {
    const {id} = req.params
    const {status} = req.body
    const allowedStatuses = ["Approved", "Denied"]

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({message: "Decision must be Approved or Denied"})
    }

    try {
        const application = await Application.findByPk(id)
        if (!application) {
            return res.status(404).json({message: "Application data not found!"})
        }
        if (["Approved", "Denied", "Rejected"].includes(application.status)) {
            return res.status(409).json({message: "This application already has a final decision"})
        }

        await application.update({status})
        return res.status(200).json({
            message: `Application successfully ${status === "Approved" ? "accepted" : "denied"}`,
            application_id: application.application_id,
            status: application.status
        })
    } catch (error) {
        return res.status(500).json({message: "An error occurred while saving the application decision"})
    }
})

//update application data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {student_id, user_id, academic_year, date_applied, status} = req.body

    try{
        const result = await Application.update(
            {
                student_id: student_id,
                user_id: user_id,
                academic_year: academic_year,
                date_applied: date_applied,
                status: status
            },
            {
                where: {application_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "Application data not found!"})
        }
        res.status(200).json({message: "Successfully updated application data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating application data"})
    }
})

//delete application
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        //remove the child rows first
        await ApplicationRequirement.destroy({where: {application_id: id}})
        const result = await Application.destroy({
            where: {application_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "Application data not found!"})
        }
        res.status(200).json({message: "Successfully deleted application"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting application. It may already have an assistance record"})
    }
})

//last line
module.exports = router

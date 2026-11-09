const express = require ('express')
const router = express.Router()

const {AssistanceRecord, Application, Student, School, User} = require ('../models')

//get request => list of assistance records
router.get("/", async (req, res) => {
    try{
        const list = await AssistanceRecord.findAll({
            attributes: ["assistance_id","application_id","user_id","amount","release_date","release_location","release_instructions","status","reference_number","student_id","payout_result","outcome_date"],
            order: [["assistance_id", "DESC"]],
            include: [
                {
                    model: Application,
                    attributes: ["application_number","academic_year"],
                    include: {
                        model: Student,
                        attributes: ["student_name"],
                        include: {
                            model: School,
                            attributes: ["school_name"]
                        }
                    }
                },
                {
                    model: Student,
                    attributes: ["student_id", "student_name"],
                    include: { model: School, attributes: ["school_name"] }
                },
                {
                    model: User,
                    attributes: ["username"]
                }
            ]
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching assistance records"})
    }
})


// Student-facing read-only release schedule. Only published/released dates are exposed.
router.get("/release-dates", async (req, res) => {
    try{
        const dates = await AssistanceRecord.findAll({
            attributes: ["assistance_id", "amount", "release_date", "release_location", "release_instructions", "status"],
            where: {release_date: {[require('sequelize').Op.ne]: null}},
            order: [["release_date", "ASC"]]
        })
        res.status(200).json(dates)
    }catch(error) {
        res.status(500).json({message: "An error occurred while fetching release dates"})
    }
})

//get assistance record details using assistance_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await AssistanceRecord.findAll({
            attributes: ["assistance_id","application_id","user_id","amount","release_date","release_location","release_instructions","status","reference_number","student_id","payout_result","outcome_date"],
            where: {assistance_id: id},
            include: [
                {
                    model: Application,
                    attributes: ["application_number","academic_year"],
                    include: {
                        model: Student,
                        attributes: ["student_name"]
                    }
                },
                {
                    model: Student,
                    attributes: ["student_id", "student_name"],
                    include: { model: School, attributes: ["school_name"] }
                },
                {
                    model: User,
                    attributes: ["username"]
                }
            ]
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching assistance record"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {application_id, student_id, user_id, amount, release_date, release_location, release_instructions, status, payout_result, outcome_date} = req.body
    try{
        const record = await AssistanceRecord.create({
            application_id: application_id || null,
            student_id,
            user_id,
            amount,
            release_date: release_date || null,
            release_location: release_location || null,
            release_instructions: release_instructions || null,
            status: status || "Pending",
            payout_result: payout_result || "Pending",
            outcome_date: outcome_date || null
        })

        //reference number => REF-001
        await record.update({
            reference_number: `REF-${String(record.assistance_id).padStart(3, "0")}`
        })

        res.status(201).json({message: "Successfully created assistance record"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new assistance record"})
    }
})

//update assistance record data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {application_id, student_id, user_id, amount, release_date, release_location, release_instructions, status, payout_result, outcome_date} = req.body

    try{
        const result = await AssistanceRecord.update(
            {
                application_id: application_id || null,
                student_id: student_id,
                user_id: user_id,
                amount: amount,
                release_date: release_date || null,
                release_location: release_location || null,
                release_instructions: release_instructions || null,
                status: status,
                payout_result: payout_result || "Pending",
                outcome_date: outcome_date || null
            },
            {
                where: {assistance_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "Assistance record data not found!"})
        }
        res.status(200).json({message: "Successfully updated assistance record data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating assistance record data"})
    }
})

// Admin confirms that the student physically received the cash assistance.
router.patch("/:id/received", async (req, res) => {
    try {
        const record = await AssistanceRecord.findByPk(req.params.id)
        if (!record) return res.status(404).json({message: "Assistance record not found"})
        if (record.payout_result === "Received") {
            return res.status(409).json({message: "Receipt has already been recorded"})
        }
        await record.update({ payout_result: "Received", status: "Complete", outcome_date: new Date().toISOString().slice(0, 10) })
        return res.json({message: "Cash assistance receipt recorded", payout_result: "Received", status: record.status, outcome_date: record.outcome_date})
    } catch (error) {
        return res.status(500).json({message: "Unable to record cash assistance receipt"})
    }
})

//delete assistance record
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await AssistanceRecord.destroy({
            where: {assistance_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "Assistance record data not found!"})
        }
        res.status(200).json({message: "Successfully deleted assistance record"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting assistance record"})
    }
})

//last line
module.exports = router

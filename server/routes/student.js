const express = require ('express')
const router = express.Router()

const {Student, School} = require ('../models')

//get request => list of students
router.get("/", async (req, res) => {
    try{
        const list = await Student.findAll({
            attributes: ["student_id","school_id","student_name","course","year_level","contact_number","status"],
            include: {
                model: School,
                attributes: ["school_name"]
            }
        })
        res.status(200).json(list)
    }catch(error) {
        res.status(404).json({message: "An error occurred while fetching students"})
    }
})

//get student details using student_id
router.get("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const data = await Student.findAll({
            attributes: ["student_id","school_id","student_name","course","year_level","contact_number","status"],
            where: {student_id: id},
            include: {
                model: School,
                attributes: ["school_name"]
            }
        })
        res.status(200).json(data)
    }catch(error) {
        res.status(500).json({message: "Database error while fetching student"})
    }
})

//creates a POST API route
router.post("/new", async (req, res) => {
    const {school_id, student_name, course, year_level, contact_number, status} = req.body
    try{
        await Student.create({
            school_id,
            student_name,
            course,
            year_level,
            contact_number,
            status
        })
        res.status(201).json({message: "Successfully created student"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while creating new student"})
    }
})

//update student data
router.put("/:id", async (req, res) => {
    const {id} = req.params
    const {school_id, student_name, course, year_level, contact_number, status} = req.body

    try{
        const result = await Student.update(
            {
                school_id: school_id,
                student_name: student_name,
                course: course,
                year_level: year_level,
                contact_number: contact_number,
                status: status
            },
            {
                where: {student_id: id}
            }
        )
        if(result[0] === 0){
            return res.status(404).json({message: "Student data not found!"})
        }
        res.status(200).json({message: "Successfully updated student data"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while updating student data"})
    }
})

//delete student
router.delete("/:id", async (req, res) => {
    const {id} = req.params
    try{
        const result = await Student.destroy({
            where: {student_id: id}
        })
        if(result === 0){
            return res.status(404).json({message: "Student data not found!"})
        }
        res.status(200).json({message: "Successfully deleted student"})
    }catch(error) {
        res.status(400).json({message: "An error occurred while deleting student"})
    }
})

//last line
module.exports = router

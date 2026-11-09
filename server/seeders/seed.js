//run => npm run seed   (basic data)
//run => npm run seed:sample   (basic data + sample students, applications and records)
const db = require ('../models')
const {hashPassword} = require ('../utils/password')

const withSample = process.argv.includes("sample")

const seed = async () => {
    await db.sequelize.sync()

    //first admin account (change the password after you login)
    const [admin] = await db.User.findOrCreate({
        where: {username: "admin"},
        defaults: {password: hashPassword("admin123"), role: "Admin"}
    })

    const schoolNames = [
        ["Sample College", "San Jose, Dinagat Islands"],
        ["Dinagat State University", "San Jose, Dinagat Islands"],
        ["San Jose National High School", "San Jose, Dinagat Islands"]
    ]
    const schools = []
    for(const [school_name, address] of schoolNames){
        const [school] = await db.School.findOrCreate({where: {school_name}, defaults: {address}})
        schools.push(school)
    }

    const requirementList = [
        ["Certificate of Enrollment", "Proof of current enrollment"],
        ["School ID", "Valid student identification"],
        ["Certificate of Indigency", "If required by the LGU"],
        ["Grades or Report Card", "Academic record if required"]
    ]
    const requirements = []
    for(const [requirement_name, description] of requirementList){
        const [requirement] = await db.Requirement.findOrCreate({where: {requirement_name}, defaults: {description}})
        requirements.push(requirement)
    }

    if(withSample && await db.Student.count() === 0){
        const people = [
            ["Juan Dela Cruz", 0, "ICT", "3rd Year", "09123456789", "Pending", "2026-04-28"],
            ["Maria Santos", 1, "BSIT", "2nd Year", "09129876543", "Approved", "2026-04-25"],
            ["Carlos Reyes", 2, "STEM", "Grade 11", "09127654321", "Under Review", "2026-04-22"],
            ["Ana Lopez", 0, "BSBA", "4th Year", "09126789123", "Approved", "2026-04-20"],
            ["Jhon Martinez", 1, "BSIT", "3rd Year", "09125678970", "Pending", "2026-04-18"]
        ]
        for(const [i, p] of people.entries()){
            const student = await db.Student.create({
                student_name: p[0], school_id: schools[p[1]].school_id, course: p[2],
                year_level: p[3], contact_number: p[4], status: "Active"
            })
            const application = await db.Application.create({
                student_id: student.student_id, user_id: admin.user_id,
                application_number: `APP-2026-${String(i + 1).padStart(3, "0")}`,
                academic_year: "2025-2026", date_applied: p[6], status: p[5]
            })
            for(const r of requirements){
                await db.ApplicationRequirement.create({
                    application_id: application.application_id, requirement_id: r.requirement_id,
                    submission_status: p[5] === "Approved" ? "Submitted" : "Pending",
                    date_submitted: p[5] === "Approved" ? p[6] : null
                })
            }
            if(p[5] === "Approved"){
                const record = await db.AssistanceRecord.create({
                    application_id: application.application_id, user_id: admin.user_id,
                    amount: 2000, release_date: p[6], status: "Released"
                })
                await record.update({reference_number: `REF-${String(record.assistance_id).padStart(3, "0")}`})
            }
        }
    }

    console.log("Seed done")
    await db.sequelize.close()
}

seed().catch(async (error) => {
    console.log("Seed failed:", error.message)
    await db.sequelize.close()
})

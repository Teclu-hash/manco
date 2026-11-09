module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define("Student", {
        student_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        student_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        course: {
            type: DataTypes.STRING,
            allowNull: false
        },
        year_level: {
            type: DataTypes.STRING,
            allowNull: false
        },
        contact_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

//association
    Student.associate = (models) => {
        Student.belongsTo(models.School, { foreignKey: "school_id" })
        Student.hasMany(models.Application, { foreignKey: "student_id" })
    }

    return Student
}

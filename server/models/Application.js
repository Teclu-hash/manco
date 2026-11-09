module.exports = (sequelize, DataTypes) => {
    const Application = sequelize.define("Application", {
        application_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        application_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        academic_year: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date_applied: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

//association
    Application.associate = (models) => {
        Application.belongsTo(models.Student, { foreignKey: "student_id" })
        Application.belongsTo(models.User, { foreignKey: "user_id" })
        Application.hasMany(models.AssistanceRecord, { foreignKey: "application_id" })
        Application.hasMany(models.ApplicationRequirement, { foreignKey: "application_id" })
    }

    return Application
}

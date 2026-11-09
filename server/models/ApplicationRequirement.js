module.exports = (sequelize, DataTypes) => {
    const ApplicationRequirement = sequelize.define("ApplicationRequirement", {
        app_requirement_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        submission_status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        date_submitted: {
            type: DataTypes.DATEONLY,
            allowNull: true
        }
    })

//association
    ApplicationRequirement.associate = (models) => {
        ApplicationRequirement.belongsTo(models.Application, { foreignKey: "application_id" })
        ApplicationRequirement.belongsTo(models.Requirement, { foreignKey: "requirement_id" })
    }

    return ApplicationRequirement
}

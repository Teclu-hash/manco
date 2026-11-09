module.exports = (sequelize, DataTypes) => {
    const Requirement = sequelize.define("Requirement", {
        requirement_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        requirement_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        deadline: { type: DataTypes.DATEONLY, allowNull: true }
    })

//association
    Requirement.associate = (models) => {
        Requirement.hasMany(models.ApplicationRequirement, { foreignKey: "requirement_id" })
        Requirement.hasMany(models.StudentSubmission, { foreignKey: "requirement_id" })
    }

    return Requirement
}

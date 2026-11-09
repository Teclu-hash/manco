module.exports = (sequelize, DataTypes) => {
    const AssistanceRecord = sequelize.define("AssistanceRecord", {
        assistance_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        payout_result: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Pending"
        },
        outcome_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        amount: {
            type: DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        release_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        release_location: { type: DataTypes.STRING, allowNull: true },
        release_instructions: { type: DataTypes.TEXT, allowNull: true },
        reference_number: {
            type: DataTypes.STRING,
            allowNull: true
        }
    })

//association
    AssistanceRecord.associate = (models) => {
        AssistanceRecord.belongsTo(models.Application, { foreignKey: "application_id" })
        AssistanceRecord.belongsTo(models.Student, { foreignKey: "student_id" })
        AssistanceRecord.belongsTo(models.User, { foreignKey: "user_id" })
    }

    return AssistanceRecord
}

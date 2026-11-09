module.exports = (sequelize, DataTypes) => {
  const StudentSubmission = sequelize.define("StudentSubmission", {
    submission_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    file_name: { type: DataTypes.STRING, allowNull: false },
    mime_type: { type: DataTypes.STRING, allowNull: false },
    file_data: { type: DataTypes.TEXT('long'), allowNull: false },
    remarks: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: "Submitted" },
    admin_remarks: { type: DataTypes.TEXT, allowNull: true }
  })

  StudentSubmission.associate = (models) => {
    StudentSubmission.belongsTo(models.User, { foreignKey: "user_id" })
    StudentSubmission.belongsTo(models.Requirement, { foreignKey: "requirement_id" })
  }

  return StudentSubmission
}

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

//association
    User.associate = (models) => {
        User.hasMany(models.Application, { foreignKey: "user_id" })
        User.hasMany(models.AssistanceRecord, { foreignKey: "user_id" })
        User.hasMany(models.StudentSubmission, { foreignKey: "user_id" })
    }

    return User
}

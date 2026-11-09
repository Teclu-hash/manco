module.exports = (sequelize, DataTypes) => {
    const School = sequelize.define("School", {
        school_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        school_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        }
    })

//association
    School.associate = (models) => {
        School.hasMany(models.Student, { foreignKey: "school_id" })
    }

    return School
}

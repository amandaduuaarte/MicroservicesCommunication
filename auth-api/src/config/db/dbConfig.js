import { Sequelize } from "sequelize";

const sequelize = new Sequelize("auth-db", "admin", "123456", {
    host: "localhost",
    dialect: "postgres",
    quoteIdentifiers: false,
    define: {
        syncOnAssociation: true,
        timestamps: false,
        underscored: true,
        underscoredAll: true,
        freezeTableName: true,
    }
});

sequelize.authenticate().then(() => {
    console.info("Authentication successful");
}).catch(err => {
    console.error(err.message, "Authentication failed");
});

export default sequelize;
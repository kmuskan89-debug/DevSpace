const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const options = {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        };

        await mongoose.connect(process.env.MONGO_URI, options);
        console.log("Database connected successfully");
    }
    catch (error) {
        console.error(`Failed to connect to the database: ${error.message || 'Unknown database connection error'}`);
        process.exit(1);
    }
};

module.exports = connectDb;

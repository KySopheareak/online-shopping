import mongoose from 'mongoose';
import env from 'dotenv';

env.config();

export let connection: mongoose.Connection | null;
export const connect = () => {
    mongoose.Promise = global.Promise
    mongoose.connect("mongodb+srv://" + process.env.MONGO_HOST + "/" + process.env.MONGO_DB_NAME, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};

// connect to database
mongoose.connection.on("connected", () => {
    console.info("===> Mongoose default connection open to database");
    connection = mongoose.connection
});

// If the connection throws an error
mongoose.connection.on("error", (err) => {
    console.info("===> Mongoose default connection error: " + err);
    setTimeout(() => connect(), 5000);
});

mongoose.connection.on("reconnected", () => {
    console.info("===> Mongoose reconnected!");
});

// When the connection is disconnected
mongoose.connection.on("disconnected", () => {
    connection = null;
    console.info("===> Mongoose default connection disconnected");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
    mongoose.connection.close(() => {
        console.info("===> Mongoose default connection disconnected through app termination");
        process.exit(0);
    });
});


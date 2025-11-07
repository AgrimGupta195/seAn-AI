import mongoose from 'mongoose';

let cached = globalThis._mongoose;
if (!cached) {
    cached = globalThis._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!process.env.MONGO_URI) {
        throw new Error('❌ MONGO_URI is not defined in environment variables');
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(process.env.MONGO_URI, {
                bufferCommands: false,
            })
            .then((mongooseInstance) => {
                console.log('✅ MongoDB connected');
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null;
                console.error('❌ MongoDB connection error:', error.message);
                throw error;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

export default connectDB;
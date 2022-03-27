import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connect_db(
    username: string,
    password: string,
    host: string,
    port: Number,
    db_name: string,
): Promise<typeof mongoose> {
    return await mongoose.connect(`mongodb://${username}:${password}@${host}:${port}/${db_name}?authSource=admin`)
}

export async function disconnect_db(): Promise<void> {
    await mongoose.disconnect()
}

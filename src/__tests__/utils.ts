import mongoose from "mongoose"


const DATABASE_USERNAME = process.env.DATABASE_USERNAME || ''
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || ''
const DATABASE_HOST = process.env.DATABASE_HOST || ''
const DATABASE_PORT = Number(process.env.DATABASE_PORT || 27017)
const DATABASE_NAME = process.env.DATABASE_NAME || ''

export function cleanup_db(database_name: string): void {
    const conn_str = `mongodb://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${database_name}?authSource=admin`
    mongoose.connect(conn_str).then(
        (mongoose) => {
            mongoose.connection.dropDatabase().then(
                () => mongoose.disconnect()
            )
        }
    )
}


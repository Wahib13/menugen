import express from 'express'
import passport from 'passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import { UserObjectAdapter } from './adapters/user_objects_adapter'
import { user_routes } from './routes/user_routes'
import { ussd_app_routes } from './routes/ussd_app_routes'
import dotenv from 'dotenv'
import { ussd_page_routes } from './routes/ussd_page_routes'
import cors from 'cors'
import { ussd_interaction_router } from './routes/ussd_interaction_routes'
import { connect_db, disconnect_db } from './mongodb'
import { tedis } from './adapters/session_adapter'
import swagger_ui from 'swagger-ui-express'
import swagger_json from './swagger.json'

dotenv.config()

export const app = express()
export const SECRET = process.env.SECRET || ''

if (!SECRET) {
    throw Error('app SECRET undefined. exiting')
}


const DATABASE_USERNAME = process.env.DATABASE_USERNAME || ''
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || ''
const DATABASE_HOST = process.env.DATABASE_HOST || ''
const DATABASE_PORT = Number(process.env.DATABASE_PORT || 27017)
const DATABASE_NAME = process.env.DATABASE_NAME || ''

const corsOptions = {
    origin: ['http://localhost:3000', 'https://menugen-ui.vercel.app'],
}

app.use(cors(corsOptions))

const opts: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRET
}
passport.use(new Strategy(opts, (payload: any, done) => {
    const user = UserObjectAdapter().getUser(payload.id)
    if (user) {
        return done(null, user)
    } else {
        return done(null, false)
    }
}))

app.use(express.json())

app.use('/docs/', swagger_ui.serve, swagger_ui.setup(swagger_json))

app.use('/api/users/', user_routes)
app.use('/api/ussd_apps/', ussd_app_routes)
app.use('/api/ussd_pages/', ussd_page_routes)

app.use('/menu_gen/pull/', ussd_interaction_router)

export const initializeApp = async (
    { database_username = DATABASE_USERNAME,
        database_password = DATABASE_PASSWORD,
        database_host = DATABASE_HOST,
        database_port = DATABASE_PORT,
        database_name = DATABASE_NAME
    }
) => {
    await connect_db(
        database_username,
        database_password,
        database_host,
        database_port,
        database_name
    )
}

export const terminateApp = async (

) => {
    await tedis.close()
    await disconnect_db()
}

import express from 'express'
import passport from 'passport'
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'
import { UserObjectAdapter } from './adapters/user_objects_adapter'
import { user_routes } from './routes/user_routes'
import { ussd_app_routes } from './routes/ussd_app_routes'
import dotenv from 'dotenv'
import { ussd_page_routes } from './routes/ussd_page_routes'

dotenv.config()

export const app = express()
export const SECRET = process.env.SECRET || ''

if (!SECRET) {
    throw Error('app SECRET undefined. exiting')
}


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

app.use('/api/users/', user_routes)
app.use('/api/ussd_apps/', ussd_app_routes)
app.use('/api/ussd_pages/', ussd_page_routes)

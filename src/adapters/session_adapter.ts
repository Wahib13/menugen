// interact with Tedis
import { Tedis } from "tedis";
import { SessionService } from "../application/ports";
import dotenv from 'dotenv'

dotenv.config()

export const tedis: Tedis = new Tedis(
    {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT || 6379),
        password: process.env.REDIS_PASSWORD
    }
)

export const SessionAdapter = (): SessionService => {
    return {
        storeSession(session: CustomerSession) {
            tedis.set(session.session_id, JSON.stringify(session))
        },
        getSession(session_id: string): Promise<CustomerSession | null> {
            return tedis.get(session_id)
                .then(
                    (data) => {
                        if (data != null) {
                            const session: CustomerSession = JSON.parse(String(data))
                            return session
                        }
                        else {
                            return null
                        }
                    }
                )
        }
    }
}
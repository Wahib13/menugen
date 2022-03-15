import { USSDAppObjectService } from "../application/ports";
import fs from 'fs'
import path from 'path'

var ussd_apps: USSDApp[] = JSON.parse(fs.readFileSync(path.join(__dirname, '../../fake_data/USSDApps.json'), 'utf-8'))

try {
    var max_id: number = Number(ussd_apps.reduce((prev, current) => {
        return (Number(prev.id) > Number(current.id)) ? prev : current
    }).id || 0)
} catch (error) {
    var max_id: number = 0
}

const writeToFile = async () => {
    await fs.writeFile('fake_data/USSDApps.json', JSON.stringify(ussd_apps), () => { })
}

export const USSDAppObjectAdapter = (): USSDAppObjectService => {
    return {
        async createUSSDApp(ussd_app: USSDApp) {
            max_id++
            const new_ussd_app: USSDApp = { ...ussd_app, id: String(max_id) }
            ussd_apps = [...ussd_apps, new_ussd_app]
            await writeToFile()
            return new_ussd_app
        },
        async queryUSSDApp(query: any) {
            return ussd_apps.find((ussd_app) => ussd_app.shortcode === query.shortcode) || null
        },
        async getUSSDApp(id: string) {
            return ussd_apps.find((ussd_app) => ussd_app.id === id) || null
        },
        async getUSSDApps() {
            return ussd_apps
        },
        async deleteUSSDApp(id: string) {
            return true
        },
        async updateUSSDApp(id: string, ussd_app: USSDApp) {
            await writeToFile()
            return ussd_app
        }
    }
}
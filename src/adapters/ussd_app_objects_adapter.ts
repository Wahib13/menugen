import { USSDAppObjectService } from "../application/ports";

var ussd_apps: USSDApp[] = [
    // {
    //     id: '1',
    //     shortcode: '*435*100#',
    // }
]

var max_id: number = 0;

export const USSDAppObjectAdapter = (): USSDAppObjectService => {
    return {
        async createUSSDApp(ussd_app: USSDApp) {
            max_id++
            const new_ussd_app: USSDApp = {...ussd_app, id: String(max_id)}
            ussd_apps = [...ussd_apps, new_ussd_app]
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
            return ussd_app
        }
    }
}
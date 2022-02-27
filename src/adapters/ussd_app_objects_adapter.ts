import { USSDAppObjectService } from "../application/ports";

export const ussd_apps: USSDApp[] = [
    {
        id: '1',
        shortcode: '*435*100#',
    }
]

export const USSDAppObjectAdapter = (): USSDAppObjectService => {
    return {
        async createUSSDApp(ussd_app: USSDApp) {
            return ussd_app
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
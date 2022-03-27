import { USSDAppObjectService } from "../application/ports";
import { Schema, model } from 'mongoose'

const USSDAppSchema: Schema<USSDApp> = new Schema<USSDApp>({
    name: { type: String, required: true },
    shortcode: { type: String, required: true },
})
USSDAppSchema.set('toJSON', {
    transform: (doc, ret, optios) => {
        ret.id = ret._id,
            delete ret._id,
            delete ret.user_id,
            delete ret.__v
    }
})

const USSDAppModel = model('USSD_App', USSDAppSchema)

export const USSDAppObjectAdapter = (): USSDAppObjectService => {
    return {
        async createUSSDApp(ussd_app: USSDApp) {
            return await USSDAppModel.create(ussd_app)
        },
        async queryUSSDApp(query: any) {
            return await USSDAppModel.findOne({ ...query })
        },
        async getUSSDApp(id: string) {
            return await USSDAppModel.findOne({ _id: id }).exec()
        },
        async getUSSDApps() {
            return USSDAppModel.find({})
        },
        async deleteUSSDApp(id: string) {
            return true
        },
        async updateUSSDApp(id: string, ussd_app: USSDApp) {
            return ussd_app
        }
    }
}
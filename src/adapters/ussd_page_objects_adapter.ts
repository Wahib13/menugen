import { PageObjectService, USSDAppObjectService } from "../application/ports";
import { Schema, model } from 'mongoose'

const PageOptionSchema: Schema<PageOption> = new Schema<PageOption> ({
    content: { type: String, required: true },
    next_page_name: { type: String, required: false },
})

const PageSchema: Schema<USSDPage> = new Schema<USSDPage>({
    ussd_app_id: { type: String, required: false },
    name: { type: String, required: true },
    context: { type: String, required: false, default: '' },
    level: { type: Number, required: true },
    options: [PageOptionSchema],
    prev_page_name: { type: String, required: false, default: '' },
    next_page_name: { type: String, required: false, default: '' },
    type: { type: String, required: true },
})
PageSchema.set('toJSON', {
    transform: (doc, ret, optios) => {
        ret.id = ret._id,
            delete ret._id,
            delete ret.user_id,
            delete ret.__v
    }
})

const PageModel = model('USSD_Page', PageSchema)

// used for error message
const anonymousApp: USSDApp = {
    shortcode: '',
    name: ''
}


const DEFAULT_ERROR_PAGE: USSDPage = {
    context: 'Sorry your request could not be processed',
    name: 'system_error_page',
    type: 'END',
    level: 1,
    options: [],
    next_page_name: null,
    prev_page_name: null,
    ussd_app_id: anonymousApp.id || null
}



export const USSDPageObjectsAdapter = (): PageObjectService => {
    return {
        async queryPage(query: any) {
            return await PageModel.findOne({...query})
        },
        async findPage(shortcode: string, page_name: string, USSDAppObjectAdapter: USSDAppObjectService) {
            const ussd_app = await USSDAppObjectAdapter.queryUSSDApp({ shortcode: shortcode })
            if (!ussd_app) {
                return DEFAULT_ERROR_PAGE
            }
            return await PageModel.findOne({ ussd_app_id: ussd_app.id, name: page_name }) || DEFAULT_ERROR_PAGE
        },
        async getPage(id: string) {
            return await PageModel.findOne({ _id: id }).exec()
        },
        async createPage(page: USSDPage) {
            const new_ussd_page: USSDPage = await PageModel.create(page)
            return new_ussd_page
        },
        async updatePage(id: string | null, page_update: USSDPageUpdate) {
            if (!id) {
                return null
            }
            await PageModel.findOneAndUpdate({ _id: id }, { ...page_update })
            return await PageModel.findOne({ _id: id })
        },
        async deletePage(id: string) {
            await PageModel.deleteOne({ _id: id })
            return true
        },
        async queryPages(query: any) {
            return PageModel.find({ ...query })
        },
        async getDefaultErrorPage() {
            return DEFAULT_ERROR_PAGE
        }
    }
}


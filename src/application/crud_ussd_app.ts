import { throwConflictError } from "../entities/errors"
import { PageObjectService, USSDAppObjectService } from "./ports"


export const getUSSDApps = async (USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp[]> => {
    return await USSDAppObjectAdapter.getUSSDApps()
}

export const getUSSDApp = async (id: string, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp | null> => {
    return await USSDAppObjectAdapter.getUSSDApp(id)
}


export const createUSSDApp = async (
    ussd_app: USSDApp,
    USSDAppObjectAdapter: USSDAppObjectService,
    USSDPageObjectsAdapter: PageObjectService
): Promise<USSDApp | null> => {
    const existing_ussd_app = await USSDAppObjectAdapter.queryUSSDApp({ shortcode: ussd_app.shortcode })
    if (existing_ussd_app) {
        throwConflictError(`USSD App on shortcode: ${ussd_app.shortcode} exists`)
    }
    const new_ussd_app: USSDApp | null = await USSDAppObjectAdapter.createUSSDApp(ussd_app)
    if (!new_ussd_app) {
        return null
    }
    const blank_page: USSDPage | null = await USSDPageObjectsAdapter.createPage({
        context: '',
        name: 'intro',
        type: 'END',
        level: 1,
        options: [],
        ussd_app_id: new_ussd_app.id || null,
        next_page_name: null,
        prev_page_name: null
    })

    if (!blank_page) {
        return null
    }


    return new_ussd_app
}


export const updateUSSDApp = async (id: string, ussd_app: USSDApp, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp | null> => {
    return await USSDAppObjectAdapter.updateUSSDApp(id, ussd_app)
}

export const deleteUSSDApp = async (id: string, USSDAppObjectAdapter: USSDAppObjectService) => {
    return await USSDAppObjectAdapter.deleteUSSDApp(id)
}

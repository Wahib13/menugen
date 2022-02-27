import { USSDAppObjectService } from "./ports"


export const getUSSDApps = async (USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp[]> => {
    return await USSDAppObjectAdapter.getUSSDApps()
}

export const getUSSDApp = async (id: string, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp | null> => {
    return await USSDAppObjectAdapter.getUSSDApp(id)
}


export const createUSSDApp = async (ussd_app: USSDApp, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp | null> => {
    return await USSDAppObjectAdapter.createUSSDApp(ussd_app)
}


export const updateUSSDApp = async (id: string, ussd_app: USSDApp, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDApp | null> => {
    return await USSDAppObjectAdapter.updateUSSDApp(id, ussd_app)
}

export const deleteUSSDApp = async (id: string, USSDAppObjectAdapter: USSDAppObjectService) => {
    return await USSDAppObjectAdapter.deleteUSSDApp(id)
}

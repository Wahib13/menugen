import { USSDAppObjectAdapter } from "../adapters/ussd_app_objects_adapter";
import { PageObjectService, USSDAppObjectService } from "./ports";

export const createUSSDPage = async (
    ussd_page: USSDPage,
    USSDPageObjectsAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<USSDPage | null> => {

    if (!ussd_page.ussd_app_id) {
        throw Error('ussd_app_id not defined')
    }
    try {
        const ussd_app: USSDApp | null = await USSDAppObjectAdapter.getUSSDApp(ussd_page.ussd_app_id)
        if (!ussd_app) {
            throw Error(`ussd app not found on ussd app id: ${ussd_page.ussd_app_id}`)
        }
        // verify ussd_page name uniqueness on existing shortcode
        const existing_page_name_clash: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                name: ussd_page.name,
                // ussd_app_id: ussd_page.ussd_app_id
                ussd_app_id: ussd_app.id
            }
        )
        if (existing_page_name_clash) {
            throw Error(`existing page name clash on name: ${ussd_page.name}, 
            shortcode: ${ussd_app.shortcode}. page id: ${existing_page_name_clash.id}`)
        }

        const created_page: USSDPage | null = await USSDPageObjectsAdapter.createPage(ussd_page)
        if (!created_page) {
            throw Error(`page creation failed`)
        }

        return created_page
        // one can never have 0 pages on an app. so no need to check for 0 pages and set level to 1
    } catch (error) {
        console.log(error)
    }

    return null
}

export const getUSSDPage = async (
    ussd_app_id: string,
    ussd_page_name: string,
    USSDPageObjectsAdapter: PageObjectService,
): Promise<USSDPage | null> => {
    console.log(ussd_app_id)
    console.log(ussd_page_name)
    try {
        const ussd_page: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                ussd_app_id: ussd_app_id,
                name: ussd_page_name
            }
        )
        console.log(ussd_page)
        return ussd_page
    } catch (error) {
        console.log(error)
        return null
    }
}

export const getUSSDPages = async (
    ussd_app_id: string,
    USSDPageObjectsAdapter: PageObjectService
): Promise<USSDPage[] | []> => {
    try {
        const ussd_pages: USSDPage[] | [] = await USSDPageObjectsAdapter.queryPages({ ussd_app_id: ussd_app_id })
        return ussd_pages
    } catch (error) {
        console.log(error)
        return []
    }
}

export const updatePage = async (
    ussd_app_id: string,
    ussd_page_name: string,
    page_update: USSDPageUpdate,
    USSDPageObjectsAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<USSDPage | null> => {
    try {
        const existing_page: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                ussd_app_id: ussd_app_id,
                name: ussd_page_name
            }
        )
        if (!existing_page) {
            throw Error(`ussd page not found. ussd_app_id: ${ussd_app_id}, page_name: ${ussd_page_name}`)
        }
        if (!existing_page.ussd_app_id) {
            throw Error(`ussd page app_id not found. ussd_app_id: ${ussd_app_id}, page_name: ${ussd_page_name}`)
        }
        const ussd_app: USSDApp | null = await USSDAppObjectAdapter.getUSSDApp(existing_page.ussd_app_id)
        if (!ussd_app) {
            throw Error(`ussd app not found on ussd app id: ${existing_page.ussd_app_id}`)
        }
        // verify ussd_page name uniqueness on existing shortcode
        const existing_page_name_clash: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                name: page_update.name,
                ussd_app_id: ussd_app.id
            }
        )
        if (existing_page_name_clash && existing_page_name_clash.id != existing_page.id) {
            throw Error(`existing page name clash on name: ${existing_page.name}, 
            shortcode: ${ussd_app.shortcode}. page id: ${existing_page_name_clash.id}`)
        }

        if (page_update.options && page_update.options.length > 0) {
            page_update.type = 'CONTINUE'
            for (let i = 0; i < page_update.options.length; i++) {
                const next_page: USSDPage | null = await createUSSDPage({
                    name: page_update.options[i].next_page_name,
                    context: '',
                    next_page_name: null,
                    prev_page_name: null,
                    options: [],
                    type: "END",
                    ussd_app_id: existing_page.ussd_app_id,
                    level: (existing_page.level || 0) + 1
                }, USSDPageObjectsAdapter, USSDAppObjectAdapter)
                if (!next_page) {
                    // page creation failed due to name clash?
                    continue
                    // throw Error(`page update failed. next page: ${page_update.options[i].next_page_name} creation failed`)
                }
            }
        }

        if (page_update.next_page_name && page_update.next_page_name != existing_page.next_page_name) {
            page_update.type = 'CONTINUE'
            const next_page: USSDPage | null = await createUSSDPage({
                name: page_update.next_page_name,
                context: '',
                next_page_name: null,
                prev_page_name: null,
                options: [],
                type: "END",
                ussd_app_id: existing_page.ussd_app_id,
                level: (existing_page.level || 0) + 1
            }, USSDPageObjectsAdapter, USSDAppObjectAdapter)
            if (!next_page) {
                throw Error(`page update failed. next page: ${page_update.next_page_name} creation failed`)
            }
        }

        const updated_page: USSDPage | null = await USSDPageObjectsAdapter.updatePage(existing_page.id || '', page_update)
        return updated_page
    } catch (error) {
        console.log(error)
        return null
    }
}

export const deletePage = async (ussd_app_id: string, name: string, USSDPageObjectsAdapter: PageObjectService): Promise<boolean> => {
    try {
        const existing_page: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                name: name,
                ussd_app_id: ussd_app_id
            }
        )
        if (!existing_page) {
            return false
        }
        const delete_result: boolean = await USSDPageObjectsAdapter.deletePage(existing_page.id || '')
        const prev_page: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                name: existing_page.prev_page_name,
                ussd_app_id: existing_page.ussd_app_id
            }
        )
        if (prev_page) {
            prev_page.next_page_name = null
            await USSDPageObjectsAdapter.updatePage(prev_page.id || null, prev_page)
        }
        return delete_result
    } catch (error) {
        return false
    }
}

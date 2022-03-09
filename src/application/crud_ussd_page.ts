import { PageObjectService, USSDAppObjectService } from "./ports";

export const createUSSDPage = async (
    ussd_page: USSDPage,
    USSDPageObjectsAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<USSDPage | null> => {

    if (!ussd_page.prev_page_name) {
        throw Error('previous page required')
    }
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
                ussd_app_id: ussd_app.id
            }
        )
        if (existing_page_name_clash) {
            throw Error(`existing page name clash on name: ${ussd_page.name}, 
            shortcode: ${ussd_app.shortcode}. page id: ${existing_page_name_clash.id}`)
        }
        const prev_page: USSDPage | null = await USSDPageObjectsAdapter.queryPage(
            {
                name: ussd_page.prev_page_name,
                ussd_app_id: ussd_app.id
            })

        if (!prev_page) {
            throw Error(`previous page with name: ${ussd_page.prev_page_name} 
            not found on app with shortcode ${ussd_app.shortcode}`)
        }
        if (prev_page.next_page_name) {
            throw Error(`previous page with name: ${prev_page.name} already has a next page: ${prev_page.next_page_name}`)
        }

        prev_page.next_page_name = ussd_page.name
        prev_page.type = 'CONTINUE'

        if (!prev_page.level) {
            throw Error(`previous page level is undefined`)
        }
        ussd_page.level = prev_page.level + 1
        const created_page: USSDPage | null = await USSDPageObjectsAdapter.createPage(ussd_page)
        if (!created_page) {
            throw Error(`page creation failed`)
        }
        // previous page needs to know its next page
        prev_page.next_page_name = created_page.name
        await USSDPageObjectsAdapter.updatePage(prev_page.id || null, prev_page)

        return created_page
        // one can never have 0 pages on an app. so no need to check for 0 pages and set level to 1
    } catch (error) {
        console.log(error)
    }

    return null
}

export const getUSSDPage = async (
    id: string,
    USSDPageObjectsAdapter: PageObjectService
): Promise<USSDPage | null> => {
    try {
        const ussd_page: USSDPage | null = await USSDPageObjectsAdapter.getPage(id)
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
    id: string,
    page_update: USSDPageUpdate,
    USSDPageObjectsAdapter: PageObjectService,
    USSDAppObjectAdapter: USSDAppObjectService
): Promise<USSDPage | null> => {
    try {
        const existing_page: USSDPage | null = await USSDPageObjectsAdapter.getPage(id)
        if (!existing_page) {
            throw Error(`page with id: ${id} does not exist`)
        }
        if (!existing_page.ussd_app_id) {
            throw Error(`page with id: ${id} does not have a USSD App`)
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
        if (existing_page_name_clash) {
            throw Error(`existing page name clash on name: ${existing_page.name}, 
            shortcode: ${ussd_app.shortcode}. page id: ${existing_page_name_clash.id}`)
        }
        const updated_page: USSDPage | null = await USSDPageObjectsAdapter.updatePage(id, page_update)
        return updated_page
    } catch (error) {
        console.log(error)
        return null
    }
}

export const deletePage = async (id: string, USSDPageObjectsAdapter: PageObjectService): Promise<boolean> => {
    try {
        const existing_page: USSDPage | null = await USSDPageObjectsAdapter.getPage(id)
        if (!existing_page) {
            return false
        }
        const delete_result: boolean = await USSDPageObjectsAdapter.deletePage(id)
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
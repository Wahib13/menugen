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
        await USSDPageObjectsAdapter.updatePage(prev_page.id, prev_page)

        return created_page
        // one can never have 0 pages on an app. so no need to check for 0 pages and set level to 1
    } catch (error) {
        console.log(error)
    }

    return null
}

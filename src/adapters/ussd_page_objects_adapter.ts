import { PageObjectService, USSDAppObjectService } from "../application/ports";

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
    next_page_name: null,
    prev_page_name: null,
    ussd_app_id: anonymousApp.id || null
}


var pages: USSDPage[] = [

]

var max_id = 0

export const USSDPageObjectsAdapter = (): PageObjectService => {
    return {
        async queryPage(query: any) {
            return pages.find((page) => page.name === query.name && page.ussd_app_id === query.ussd_app_id) || null
        },
        async findPage(shortcode: string, page_name: string, USSDAppObjectAdapter: USSDAppObjectService) {

            const filter_pages = async (page: USSDPage) => {
                const ussd_app = await USSDAppObjectAdapter.queryUSSDApp({ ussd_app_id: page.ussd_app_id })
                return (ussd_app?.shortcode === shortcode) && (page.name === page_name)
            }
            return pages.find(filter_pages) || DEFAULT_ERROR_PAGE
        },
        async getPage(id: string) {
            return pages.find((page) => page.id == id) || null
        },
        async createPage(page: USSDPage) {
            max_id++
            const new_ussd_page: USSDPage = { ...page, id: String(max_id) }
            pages = [...pages, new_ussd_page]
            return new_ussd_page
        },
        async updatePage(id: string | null, new_page: USSDPage) {
            if (!id) {
                return null
            }
            const page_to_update: USSDPage | null = pages.find((page) => page.id === id) || null
            if (page_to_update) {
                pages[pages.indexOf(page_to_update)] = new_page
            }
            const updated_page: USSDPage | null = pages.find((page) => page.id === id) || null
            if (updated_page) {
                return updated_page
            }
            return null
        }
    }
}


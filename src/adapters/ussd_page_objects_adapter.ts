import { PageObjectService, USSDAppObjectService } from "../application/ports";

// used for error message
const anonymousApp: USSDApp = {
    id: null,
    shortcode: '',
    name: ''
}


const DEFAULT_ERROR_PAGE: USSDPage = {
    id: null,
    context: 'Sorry your request could not be processed',
    name: 'system_error_page',
    type: 'END',
    ussd_app_id: anonymousApp.id
}


var pages: USSDPage[] = [
    
]

var max_id = 0

export const USSDPageObjectsAdapter = (): PageObjectService => {
    return {
        async findPage(shortcode: string, page_name: string, USSDAppObjectAdapter: USSDAppObjectService) {
            
            const filter_pages = async (page: USSDPage) => {
                const ussd_app = await USSDAppObjectAdapter.findUSSDApp(page.ussd_app_id)
                return (ussd_app?.shortcode === shortcode) && (page.name === page_name)
            }
            return pages.find(filter_pages) || DEFAULT_ERROR_PAGE
        },
        async getPage(id: string) {
            return pages.find((page) => page.id == id) || null
        },
        async createPage(page: USSDPage) {
            max_id++
            const new_ussd_page: USSDPage = {...page, id: String(max_id)}
            pages = [...pages, new_ussd_page]
            return page
        }
    }
}


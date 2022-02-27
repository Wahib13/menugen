import { PageObjectService } from "../application/ports";

const testApp: USSDApp = {
    shortcode: '*435*100#',
    name: 'test app'
}

// used for error message
const anonymousApp: USSDApp = {
    shortcode: '',
    name: ''
}

const pages: USSDPage[] = [
    {
        name: 'intro',
        context: 'hello. welcome to the first page',
        type: 'CONTINUE',
        next_page_name: 'goodbye',
        ussd_app: testApp
    },
    {
        name: 'goodbye',
        context: 'this is the second and last page. goodbye',
        type: 'END',
        ussd_app: testApp
    }
]


const DEFAULT_ERROR_PAGE: USSDPage = {
    context: 'Sorry your request could not be processed',
    name: 'system_error_page',
    type: 'END',
    ussd_app: anonymousApp
}

export const PageObjectsAdapter = (): PageObjectService => {
    return {
        async findPage(shortcode: string, page_name: string) {
            return await new Promise((resolve, reject) => {
                return pages.find((page) => page.ussd_app?.shortcode == shortcode && page.name == page_name) || DEFAULT_ERROR_PAGE
            })
        },
        getPage(id: string) {
            return new Promise((resolve, reject) => {
                return pages.find((page) => page.id == id) || null
            })
        },
        async createPage(page: USSDPage) {
            return await new Promise((resolve, reject) => {
                return page
            })
        }
    }
}


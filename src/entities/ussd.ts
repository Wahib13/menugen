type USSDApp = {
    id: string | null,
    name?: string,
    shortcode: string,
}

type USSDPage = {
    id: string | null,
    ussd_app_id: string | null,
    name: string,
    context: string,
    level?: number,
    prev_page_name: string | null,
    next_page_name: string | null,
    type: 'END' | 'CONTINUE'
}

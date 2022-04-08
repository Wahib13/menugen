type USSDApp = {
    id?: string,
    name?: string,
    shortcode: string,
}

type USSDPage = {
    id?: string,
    ussd_app_id: string | null,
    name: string,
    context: string,
    level?: number,
    options: PageOption[],
    prev_page_name: string | null,
    next_page_name: string | null,
    type: 'END' | 'CONTINUE'
}

type PageOption = {
    content: string,
    next_page_name: string
}

type CustomerFeedbackPage = {
    content: string,
    type: 'END' | 'CONTINUE'
}

type USSDPageUpdate = {
    name?: string,
    next_page_name?: string | null,
    options?: PageOption[],
    context?: string,
    type?: 'END' | 'CONTINUE'
}
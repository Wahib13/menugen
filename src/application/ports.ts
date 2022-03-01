export interface SessionService {
    storeSession(session: CustomerSession): void,
    getSession(session_id: string): Promise<CustomerSession | null>
}

export interface UserObjectService {
    findUser(query: object): Promise<User | null>
    getUser(id: string): Promise<User | null>
    getUsers(): Promise<User[] | null>
    createUser(user: User): Promise<User | null>
    deleteUser(id: string): Promise<boolean>
}

export interface PageObjectService {
    findPage(shortcode: string, page_name: string | undefined, USSDAppObjectAdapter: USSDAppObjectService): Promise<USSDPage>
    queryPage(query: object): Promise<USSDPage | null>
    getPage(id: string): Promise<USSDPage | null>
    // getPages(): USSDPage[]
    createPage(page: USSDPage): Promise<USSDPage | null>
    updatePage(id: string | null, page: USSDPage): Promise<USSDPage | null>
    // deletePage(id: string): boolean
}

export interface USSDAppObjectService {
    getUSSDApp(id: string): Promise<USSDApp | null>
    getUSSDApps(): Promise<USSDApp[]>
    queryUSSDApp(query: object): Promise<USSDApp | null>
    createUSSDApp(ussd_app: USSDApp): Promise<USSDApp | null>
    updateUSSDApp(id: string, ussd_app: USSDApp): Promise<USSDApp | null>
    deleteUSSDApp(id: string): Promise<boolean | null>
}

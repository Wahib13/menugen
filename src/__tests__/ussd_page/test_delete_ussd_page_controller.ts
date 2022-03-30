import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app, initializeApp, terminateApp } from '../../app'
import { hashPassword } from '../../application/crud_user'
import { cleanup_db } from '../utils'
import http_status_codes from 'http-status-codes'

const database_name = 'test_delete_ussd_page'

const requestWithSuperTest = supertest(app)

const test_user: User = {
    id: null,
    username: "testuser",
    email: "test@test.com",
    password: "awbaeir2438u",
}

const createTestUser = async (): Promise<User | null> => {

    return await UserObjectAdapter().createUser({
        id: null,
        username: test_user.username,
        password: await hashPassword(test_user.password || ''),
        email: test_user.email
    })
}

const login = async (user: User) => {

    const res_login = await requestWithSuperTest.post('/api/users/auth/')
        .send(
            {
                username: user.username,
                password: user.password
            }
        )

    const token = res_login.body.token
    return token
}

describe('USSD Page Endpoints', () => {

    beforeAll(async () => {
        await initializeApp({ database_name: database_name })
        await createTestUser()
    })

    afterAll(async () => {
        await terminateApp()
        await cleanup_db(database_name)
    })

    it('Delete a USSD Page. It requires a USSD page is already created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*103#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_app)
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual(test_create_ussd_app.shortcode)
        expect(res.body.id).not.toBe(null || undefined)

        const test_create_ussd_page: USSDPage = {
            context: 'hello',
            name: 'second_page',
            prev_page_name: 'intro',
            type: 'END',
            options: [],
            ussd_app_id: res.body.id,
            next_page_name: null
        }
        const res_create_page = await requestWithSuperTest
            .post('/api/ussd_pages/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_page)
        expect(res_create_page.status).toEqual(201)
        expect(res_create_page.body.id).not.toBe(null || undefined)
        expect(res_create_page.body.context).toEqual(test_create_ussd_page.context)

        const res_delete_page = await requestWithSuperTest
            .delete(`/api/ussd_pages/${res_create_page.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_delete_page.status).toEqual(http_status_codes.OK)

        const res_get_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res_create_page.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page.status).toEqual(http_status_codes.NOT_FOUND)


        const res_get_all_pages = await requestWithSuperTest
            .get(`/api/ussd_pages?app_id=${res.body.id}`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_all_pages.status).toEqual(200)
        expect(res_get_all_pages.body[0].next_page_name).toEqual(null)
    })
})

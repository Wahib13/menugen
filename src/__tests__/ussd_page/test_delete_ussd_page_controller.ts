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

        // update intro page to include options
        const test_update_ussd_page: USSDPageUpdate = {
            context: 'how are you feeling today',
            name: 'intro',
            options: [
                {
                    next_page_name: 'happy_page',
                    content: 'feeling happy'
                },
                {
                    next_page_name: 'sad_page',
                    content: 'feeling sad'
                }
            ],
        }

        const res_update_page = await requestWithSuperTest
            .put(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
            .send(test_update_ussd_page)
        expect(res_update_page.status).toEqual(200)

        const res_delete_page = await requestWithSuperTest
            .delete(`/api/ussd_pages/${res.body.id}/happy_page`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_delete_page.status).toEqual(http_status_codes.OK)

        const res_get_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/happy_page`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page.status).toEqual(http_status_codes.NOT_FOUND)

        const res_get_intro_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_intro_page.status).toEqual(http_status_codes.OK)
        expect(res_get_intro_page.body.options.length).toEqual(1)
    })
})

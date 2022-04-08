import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app, initializeApp, terminateApp } from '../../app'
import { hashPassword } from '../../application/crud_user'
import { cleanup_db } from '../utils'

const database_name = 'test_update_ussd_page'

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

    it('Update a USSD Page. It requires a USSD page is already created', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*102#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_app)
        expect(res.status).toEqual(201)
        expect(res.body.shortcode).toEqual(test_create_ussd_app.shortcode)
        expect(res.body.id).not.toBe(null || undefined)

        // check the default page is created
        const res_get_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page.body.ussd_app_id).toEqual(res.body.id)
        expect(res_get_page.body.name).toEqual('intro')
        const test_update_ussd_page: USSDPageUpdate = {
            context: 'hello from the other side!',
            name: 'intro',
            next_page_name: 'page2',
            // type: 'CONTINUE',
        }
        const res_update_page = await requestWithSuperTest
            .put(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
            .send(test_update_ussd_page)
        expect(res_update_page.status).toEqual(200)
        expect(res_update_page.body.name).toEqual(test_update_ussd_page.name)
        expect(res_update_page.body.type).toEqual('CONTINUE')

        const res_get_new_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/page2`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_new_page.status).toEqual(200)
        expect(res_get_new_page.body.name).toEqual('page2')
    })

    it('Update a page with options. Requires an existing page', async () => {
        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*103#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(test_create_ussd_app)
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
            // type: 'CONTINUE',
        }
        const res_update_page = await requestWithSuperTest
            .put(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
            .send(test_update_ussd_page)
        expect(res_update_page.status).toEqual(200)

        // get back page to see if it was updated
        const res_get_page = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/intro`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_page.status).toEqual(200)
        expect(res_get_page.body.options.length).toBeGreaterThan(0)
        expect(res_get_page.body.type).toBe('CONTINUE')

        // if new pages were created
        const res_get_new_page1 = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/happy_page`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_new_page1.status).toEqual(200)
        expect(res_get_new_page1.body.name).toBe('happy_page')
        const res_get_new_page2 = await requestWithSuperTest
            .get(`/api/ussd_pages/${res.body.id}/sad_page`)
            .set('Authorization', `Bearer ${token}`)
        expect(res_get_new_page2.status).toEqual(200)
        expect(res_get_new_page2.body.name).toBe('sad_page')
    })
})

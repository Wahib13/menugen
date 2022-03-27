import mongoose from 'mongoose'
import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app, initializeApp, terminateApp } from '../../app'
import { hashPassword } from '../../application/crud_user'
import { cleanup_db } from '../utils'

const database_name = 'test_ussd_app_validator'

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

describe('USSD app endpoints', () => {

    beforeAll(async () => {
        await initializeApp({ database_name: database_name })
        await createTestUser()
    })

    afterAll(async () => {
        await terminateApp()
        await cleanup_db(database_name)
    })

    it('Validate USSD app creation. should fail with 40x error', async () => {

        const token = await login(test_user)

        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*100#",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(
                test_create_ussd_app
            )
        expect(res.status).toEqual(400)
    })

    it('multiple apps with the same shortcode should fail', async () => {
        const token = await login(test_user)
        const test_create_ussd_app: USSDApp = {
            shortcode: "*435*105#",
            name: "test_ussd_app",
        }
        const res = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(
                test_create_ussd_app
            )
        expect(res.status).toEqual(201)
        expect(res.body.id).not.toBe(null || undefined)
        const res2 = await requestWithSuperTest
            .post('/api/ussd_apps/')
            .set('Authorization', `Bearer ${token}`)
            .send(
                test_create_ussd_app
            )
        expect(res2.status).toEqual(409)
    })
})

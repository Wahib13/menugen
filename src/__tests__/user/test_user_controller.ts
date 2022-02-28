import supertest from 'supertest'
import { UserObjectAdapter } from '../../adapters/user_objects_adapter'
import { app } from '../../app'
import { hashPassword } from '../../application/crud_user'

const requestWithSuperTest = supertest(app)

describe('User endpoints', () => {

    var test_user: any = {
        username: "testuser",
        email: "test@test.com",
        password: "awbaeir2438u",
    }

    beforeAll(async () => {
        UserObjectAdapter().createUser({
            id: null,
            username: test_user.username,
            password: hashPassword(test_user.password),
            email: test_user.email
        }).then((created_user) => test_user = { ...test_user, id: created_user?.id || null })
    })

    afterAll(async () => {
        if (test_user.id) {
            await UserObjectAdapter().deleteUser(test_user.id)
        }
    })

    it('Create User, login and view user. user with different login should fail', async () => {
        const test_create_user = {
            username: "farid",
            password: "secret",
            email: "farid@y.com"
        }
        const res = await requestWithSuperTest.post('/api/users/')
            .send(
                test_create_user
            )
        expect(res.status).toEqual(201)
        expect(res.body.username).toEqual("farid")
        expect(res.body.email).toEqual("farid@y.com")
        expect(res.body.password).not.toBe(null || undefined)
        expect(res.body.id).not.toBe(null || undefined)

        // todo fix this to make only the same user be able to view his own details
        const res_login = await requestWithSuperTest.post('/api/users/auth/')
            .send(
                {
                    username: test_create_user.username,
                    password: test_create_user.password
                }
            )
        expect(res_login.status).toEqual(200)
        expect(res_login.body.token).not.toBe(null || undefined)

        const token = res_login.body.token

        const res_get = await requestWithSuperTest.get(`/api/users/${res.body.id}`).set('Authorization', `Bearer ${token}`)
        expect(res_get.status).toEqual(200)
        expect(res_get.body.id).toEqual(res.body.id)
        expect(res_get.body.username).toEqual(res.body.username)
        expect(res_get.body.email).toEqual(res.body.email)
        expect(res_get.body.password).not.toBe(null || undefined)
    })

    // it('POST /api/users/ invalid request body should fail', async () => {
    //     const res = await requestWithSuperTest.post('/api/users/')
    //         .send({
    //             username: "john",
    //             raw_password: "secret2",
    //             email: "invalidemailstring"
    //         })
    //     expect(res.status).toEqual(400)
    // })
})

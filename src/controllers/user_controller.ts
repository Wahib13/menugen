import express from 'express'
import { UserObjectAdapter } from '../adapters/user_objects_adapter'
import { authenticateUser, createUser, getUser, getUsers } from '../application/crud_user'
import jwt from 'jsonwebtoken'
import { SECRET } from '../app'
import http_status_codes from 'http-status-codes'


export const registerUser = async (req: express.Request, res: express.Response) => {

    const new_user: User = {
        id: null,
        username: req.body.username,
        email: req.body.email,
        password: null
    }
    try {
        const user = await createUser(new_user, req.body.password, UserObjectAdapter())
        res.status(http_status_codes.CREATED).send(user)
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR).send(error)
    }
}

export const login = async (req: express.Request, res: express.Response) => {
    try {
        const user = await authenticateUser(req.body.username, req.body.password, UserObjectAdapter())
        if (user !== null && user !== undefined) {
            const token = jwt.sign(user, SECRET)
            res.status(http_status_codes.OK).send({ token: token })
        }
        if (!user) {
            res.status(http_status_codes.UNAUTHORIZED).send({ error: 'unauthorized' })
        }
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR)
    }
}

export const showUser = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id
        const user = await getUser(id, UserObjectAdapter())
        res.status(http_status_codes.OK).send(user)
    } catch (error) {
        console.log(error)
        res.status(500)
    }
}

export const showAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const users = await getUsers(UserObjectAdapter())
        res.status(http_status_codes.OK).send(users)
    } catch (error) {
        console.log(error)
        res.status(http_status_codes.INTERNAL_SERVER_ERROR)
    }
}
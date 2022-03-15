import { UserObjectService } from "./ports";
import bcrypt from 'bcrypt'


export const createUser = async (
    user: User,
    raw_password: string,
    UserObjectAdapter: UserObjectService
): Promise<User | null> => {
    // TODO user validations
    const user_copy: User = { ...user, password: await hashPassword(raw_password) }
    try {
        const user = await UserObjectAdapter.createUser(user_copy)
        return user

    } catch (error) {
        console.log(error)
    }
    return null
}

export const authenticateUser = async (
    username: string,
    raw_password: string,
    UserObjectAdapter: UserObjectService
): Promise<User | null> => {
    try {
        const user: User | null = await UserObjectAdapter.findUser({ username: username })
        if (!user) {
            return null
        }
        if (await bcrypt.compare(raw_password, user.password || '')) {
            return user
        }
    } catch (error) {
        console.log(error)
    }
    return null
}

export const getUser = async (
    id: string,
    UserObjectAdapter: UserObjectService
): Promise<User | null> => {
    try {
        return await UserObjectAdapter.getUser(id)
    } catch (error) {
        console.log(error)
    }
    return null
}

export const getUsers = async (
    UserObjectAdapter: UserObjectService
): Promise<User[] | null> => {
    try {
        return await UserObjectAdapter.getUsers()
    } catch (error) {
        console.log(error)
    }
    return null
}

export const hashPassword = async (
    raw_password: string
): Promise<string> => {
    return await bcrypt.hash(raw_password, 10)
}

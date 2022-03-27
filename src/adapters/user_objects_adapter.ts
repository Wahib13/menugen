import { UserObjectService } from "../application/ports";
import { Schema, model } from "mongoose";

const UserSchema: Schema<User> = new Schema<User>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
})
UserSchema.set('toObject', {
    transform: (doc, ret, optios) => {
        ret.id = ret._id,
            delete ret._id,
            delete ret.user_id,
            delete ret.__v
    }
})

const UserModel = model('users', UserSchema)

export const UserObjectAdapter = (): UserObjectService => {
    return {
        async getUser(id: string) {
            const user = await UserModel.findOne({ _id: id }).exec()
            if (user) {
                return user.toObject()
            }
            return null
        },
        async getUsers() {
            return await UserModel.find({})
        },
        async createUser(user: User) {
            const new_user = await UserModel.create(user)
            return new_user.toObject()
        },
        async findUser(query: any) {
            const user = await UserModel.findOne(query).exec()
            if (user) {
                return user.toObject()
            }
            return null
        },
        async deleteUser(id: string) {
            await UserModel.deleteOne({ _id: id })
            return true
        }
    }
}

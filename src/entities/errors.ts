export class CustomError {
    name: string

    static ConflictError = new CustomError('CONFLICT')


    constructor(name: string) {
        this.name = name
    }
}

export const throwConflictError = (message: string) => {
    throw {
        name: CustomError.ConflictError,
        message: message
    }
}
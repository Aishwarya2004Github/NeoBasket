import jwt from 'jsonwebtoken'
import prisma from '../config/prisma.js'

const genertedRefreshToken = async (userId) => {

    console.log(process.env.SECRET_KEY_REFRESH_TOKEN)

    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    )

    await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            refresh_token: token
        }
    })

    return token
}

export default genertedRefreshToken
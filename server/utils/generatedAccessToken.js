import jwt from 'jsonwebtoken'

const generatedAccessToken = async (userId) => {

    console.log(process.env.SECRET_KEY_ACCESS_TOKEN)

    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '5h' }
    )

    return token
}

export default generatedAccessToken
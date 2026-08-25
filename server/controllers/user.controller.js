import sendEmail from '../config/sendEmail.js'
import prisma from "../config/prisma.js"
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageLocal.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'

export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body
        if (password.length < 8 || password.length > 12) {
    return response.status(400).json({
        message: "Password must be between 8 and 12 characters",
        error: true,
        success: false
    })
}

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Provide name, email and password",
                error: true,
                success: false
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (user) {
            return response.status(400).json({
                message: "Email already registered",
                error: true,
                success: false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashPassword
        }

        const save = await prisma.user.create({
            data: payload
        })

        // Email verification temporarily disabled

        return response.status(201).json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: save
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message,
            error: true,
            success: false
        })
    }
}
export async function verifyEmailController(request,response){
    try {
        const { code } = request.body

        const user = await prisma.user.findUnique({
  where:{
    id: code
  }
})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await prisma.user.update({
  where:{
    id:code
  },
  data:{
    verify_email:true
  }
})

        return response.json({
            message : "Verify email done",
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : true
        })
    }
}

//login controller
export async function loginController(request,response){
    try {
        const { email , password } = request.body


        if(!email || !password){
            return response.status(400).json({
                message : "provide email, password",
                error : true,
                success : false
            })
        }

        const user = await prisma.user.findUnique({
  where: {
    email
  }
});

        if(!user){
            return response.status(400).json({
                message : "User not register",
                error : true,
                success : false
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : "Contact to Admin",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Check your password",
                error : true,
                success : false
            })
        }

        console.log("Before access token")
const accesstoken = await generatedAccessToken(user.id)

console.log("Before refresh token")
const refreshToken = await genertedRefreshToken(user.id)

console.log("After refresh token")

        const updateUser = await prisma.user.update({
  where:{
    id:user.id
  },
  data:{
    last_login_date:new Date()
  }
})
        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message : "Login successfully",
            error : false,
            success : true,
            data : {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//logout controller
export async function logoutController(request,response){
    try {
        const userid = request.userId //middleware

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await prisma.user.update({
  where:{
    id:userid
  },
  data:{
    refresh_token:""
  }
})

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//upload user avatar
export async  function uploadAvatar(request,response){
    try {
        const userId = request.userId // auth middlware
        const image = request.file  // multer middleware

        const upload = await uploadImageClodinary(image)
        
        const updateUser = await prisma.user.update({
  where:{
    id:userId
  },
  data:{
    avatar:upload.url
  }
})
        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update user details
export async function updateUserDetails(request,response){
    try {
        const userId = request.userId //auth middleware
        const { name, email, mobile, password } = request.body 

        let hashPassword = ""

        if (password) {
    if (password.length < 8 || password.length > 12) {
        return response.status(400).json({
            message: "Password must be between 8 and 12 characters",
            error: true,
            success: false
        })
    }

    const salt = await bcryptjs.genSalt(10)
    hashPassword = await bcryptjs.hash(password, salt)
}

        const updateUser = await prisma.user.update({
  where:{
    id:userId
  },
  data:{
            ...(name && { name : name }),
            ...(email && { email : email }),
            ...(mobile && { mobile : mobile }),
            ...(password && { password : hashPassword })
    }})

        return response.json({
            message : "Updated successfully",
            error : false,
            success : true,
            data : updateUser
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//forgot password not login
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body 

        const user = await prisma.user.findUnique({
  where: {
    email
  }
});

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

       const otp = String(generatedOtp())
const expireTime = Date.now() + 60 * 60 * 1000

await prisma.user.update({
  where: { id: user.id },
  data: {
    forgot_password_otp: otp,
    forgot_password_expiry: new Date(expireTime)
  }
})

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from NeoBasket",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return response.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//verify forgot password otp
export async function verifyForgotPasswordOtp(request, response) {
  try {
    const { email, otp } = request.body

    if (!email || !otp) {
      return response.status(400).json({
        message: "Provide email and otp",
        error: true,
        success: false
      })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return response.status(400).json({
        message: "Email not available",
        error: true,
        success: false
      })
    }

    // expiry check (FIXED)
    if (new Date() > user.forgot_password_expiry) {
      return response.status(400).json({
        message: "Otp is expired",
        error: true,
        success: false
      })
    }

    // otp check
    if (otp !== user.forgot_password_otp) {
      return response.status(400).json({
        message: "Invalid otp",
        error: true,
        success: false
      })
    }

    // clear OTP after success
    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgot_password_otp: null,
        forgot_password_expiry: null
      }
    })

    return response.json({
      message: "OTP verified successfully",
      success: true,
      error: false
    })

  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    })
  }
}

//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await prisma.user.findUnique({
  where: {
    email
  }
});

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if (newPassword.length < 8 || newPassword.length > 12) {
    return response.status(400).json({
        message: "Password must be between 8 and 12 characters",
        error: true,
        success: false
    })
}

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await prisma.user.update({
  where:{
    id:user.id
  },
  data:{
    password:hashPassword
  }
})

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//get login user details
//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.userId

        console.log(userId)

        const user = await prisma.user.findUnique({
            where:{
                id:userId
            },
            select:{
                id:true,
                name:true,
                email:true,
                mobile:true,
                avatar:true,
                role:true,
                status:true,
                verify_email:true,
                createdAt:true
            }
        })

        return response.json({
            message : 'user details',
            data : {
                _id : user.id,
                name : user.name,
                email : user.email,
                mobile : user.mobile,
                avatar : user.avatar,
                role : user.role,
                status : user.status,
                verify_email : user.verify_email,
                createdAt : user.createdAt
            },
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}
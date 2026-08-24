import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";


// ================= AUTH MIDDLEWARE =================

export const auth = async (request, response, next) => {

    try {

        let token = null;


        // Cookie token
        if(request.cookies?.accessToken){
            token = request.cookies.accessToken;
        }


        // Header token
        else if(request.headers.authorization){

            const authHeader = request.headers.authorization;


            if(authHeader.startsWith("Bearer ")){

                token = authHeader.split(" ")[1];

            }

        }



        if(!token){

            return response.status(401).json({

                message:"Provide token",
                success:false,
                error:true

            });

        }



        const decode = jwt.verify(

            token,

            process.env.SECRET_KEY_ACCESS_TOKEN

        );



        request.userId = decode.id;



        const user = await prisma.user.findUnique({

            where:{
                id:decode.id
            }

        });



        if(!user){

            return response.status(401).json({

                message:"User not found",
                success:false,
                error:true

            });

        }



        request.role = user.role;

        request.user = user;



        console.log(
            "LOGIN USER ROLE :",
            user.role
        );



        next();



    }catch(error){


        console.log(
            "JWT ERROR:",
            error.message
        );


        return response.status(401).json({

            message:error.message,

            success:false,

            error:true

        });


    }

};
// ================= ADMIN MIDDLEWARE =================


export const admin = async(request,response,next)=>{


    try{


        console.log(
            "ADMIN CHECK :",
            request.role
        );



        if(request.role !== "ADMIN"){


            return response.status(403).json({

                message:"Admin access only",

                success:false,

                error:true

            });

        }



        next();



    }catch(error){


        return response.status(500).json({

            message:error.message,

            success:false,

            error:true

        });


    }


};
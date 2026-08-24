const jwt = require("jsonwebtoken");
const prisma = require("./config/prisma");


/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

async function auth(req, res, next) {
    try {

        /* =====================================================
           1. GET ACCESS TOKEN
        ===================================================== */

        let token = null;


        // Cookie se token
        if (req.cookies?.accessToken) {
            token = req.cookies.accessToken;
        }


        // Authorization header se token
        const authorization =
            req.headers.authorization;


        if (
            !token &&
            authorization &&
            authorization.startsWith("Bearer ")
        ) {
            token =
                authorization
                    .slice(7)
                    .trim();
        }


        /* =====================================================
           2. TOKEN CHECK
        ===================================================== */

        if (!token) {

            return res.status(401).json({
                success: false,
                error: true,
                message: "Authentication required",
            });
        }


        /* =====================================================
           3. ACCESS TOKEN SECRET
        ===================================================== */

        const accessTokenSecret =
            process.env.SECRET_KEY_ACCESS_TOKEN;


        if (!accessTokenSecret) {

            console.error(
                "SECRET_KEY_ACCESS_TOKEN is missing"
            );

            return res.status(500).json({
                success: false,
                error: true,
                message:
                    "SECRET_KEY_ACCESS_TOKEN is not configured in AI engine",
            });
        }


        /* =====================================================
           4. VERIFY JWT
        ===================================================== */

        let decoded;

        try {

            decoded = jwt.verify(
                token,
                accessTokenSecret
            );

        } catch (jwtError) {

            console.error(
                "JWT VERIFY ERROR:",
                jwtError?.message
            );

            return res.status(401).json({
                success: false,
                error: true,
                message:
                    jwtError?.message ||
                    "Invalid access token",
            });
        }


        /* =====================================================
           5. GET USER ID FROM TOKEN
        ===================================================== */

        /*
         * Different login implementations
         * different property names use kar sakti hain.
         */

        const userId =
            decoded?.id ||
            decoded?.userId ||
            decoded?._id ||
            decoded?.sub;


        console.log(
            "AI JWT DECODED:",
            decoded
        );


        console.log(
            "AI JWT USER ID:",
            userId
        );


        /* =====================================================
           6. USER ID REQUIRED
        ===================================================== */

        if (!userId) {

            return res.status(401).json({
                success: false,
                error: true,
                message:
                    "Invalid access token payload",
                decoded,
            });
        }


        /* =====================================================
           7. FIND USER
        ===================================================== */

        let user;

        try {

            user =
                await prisma.user.findUnique({
                    where: {
                        id: String(userId),
                    },
                });

        } catch (dbError) {

            console.error(
                "AI USER LOOKUP ERROR:",
                dbError?.message
            );

            return res.status(500).json({
                success: false,
                error: true,
                message:
                    "Unable to fetch user",
            });
        }


        /* =====================================================
           8. USER NOT FOUND
        ===================================================== */

        if (!user) {

            return res.status(401).json({
                success: false,
                error: true,
                message: "User not found",
            });
        }


        /* =====================================================
           9. ATTACH USER TO REQUEST
        ===================================================== */

        req.userId =
            user.id;

        req.userRole =
            user.role;

        req.user =
            user;


        /* =====================================================
           10. CONTINUE
        ===================================================== */

        next();

    } catch (error) {

        console.error(
            "AI AUTH ERROR:",
            error
        );

        return res.status(401).json({
            success: false,
            error: true,
            message:
                error?.message ||
                "Invalid token",
        });
    }
}


/* =========================================================
   ADMIN MIDDLEWARE
========================================================= */

function admin(req, res, next) {

    if (
        req.userRole !== "ADMIN"
    ) {

        return res.status(403).json({
            success: false,
            error: true,
            message:
                "Admin access only",
        });
    }


    next();
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
    auth,
    admin,
};
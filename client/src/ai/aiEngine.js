import axios from "axios";

/* =========================================================
   BASE URLS
========================================================= */

export const AI_BASE_URL =
    import.meta.env.VITE_AI_ENGINE_URL ||
    "http://localhost:8002";

export const MAIN_API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080";


/* =========================================================
   TOKEN KEYS
========================================================= */

const ACCESS_TOKEN_KEYS = [
    "accesstoken",
    "accessToken",
    "access_token",
    "token",
];

const REFRESH_TOKEN_KEYS = [
    "refreshToken",
    "refresh_token",
];


/* =========================================================
   USER STORAGE KEYS
========================================================= */

const USER_STORAGE_KEYS = [
    "user",
    "userData",
    "userInfo",
    "currentUser",
    "profile",
    "auth",
    "authUser",
    "loggedInUser",
    "account",
];


/* =========================================================
   TOKEN HELPERS
========================================================= */

const getAccessToken = () => {
    for (const key of ACCESS_TOKEN_KEYS) {
        const token = localStorage.getItem(key);

        if (
            typeof token === "string" &&
            token.trim()
        ) {
            return token.trim();
        }
    }

    return "";
};


const getRefreshToken = () => {
    for (const key of REFRESH_TOKEN_KEYS) {
        const token = localStorage.getItem(key);

        if (
            typeof token === "string" &&
            token.trim()
        ) {
            return token.trim();
        }
    }

    return "";
};


const saveAccessToken = (token) => {
    if (
        typeof token !== "string" ||
        !token.trim()
    ) {
        console.error(
            "Cannot save empty/invalid access token"
        );

        return false;
    }

    const cleanToken = token.trim();

    localStorage.setItem(
        "accesstoken",
        cleanToken
    );

    localStorage.removeItem("accessToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");

    return true;
};


const clearAccessToken = () => {
    ACCESS_TOKEN_KEYS.forEach((key) => {
        localStorage.removeItem(key);
    });
};


const clearRefreshToken = () => {
    REFRESH_TOKEN_KEYS.forEach((key) => {
        localStorage.removeItem(key);
    });
};


const clearAuthTokens = () => {
    clearAccessToken();
    clearRefreshToken();
};


/* =========================================================
   GENERIC USER ID EXTRACTOR
========================================================= */

const extractUserId = (value) => {
    if (!value) {
        return null;
    }

    /*
     * Direct primitive ID
     */
    if (
        typeof value === "string" ||
        typeof value === "number"
    ) {
        const id = String(value).trim();

        return id || null;
    }


    if (typeof value !== "object") {
        return null;
    }


    /*
     * Direct common ID fields
     */
    const directId =
        value.id ??
        value._id ??
        value.userId ??
        value.user_id ??
        value.uid ??
        value.userID ??
        value.customerId ??
        value.customer_id;


    if (
        directId !== undefined &&
        directId !== null &&
        String(directId).trim()
    ) {
        return String(directId).trim();
    }


    /*
     * Common nested structures
     */
    const nestedObjects = [
        value.user,
        value.data,
        value.profile,
        value.account,
        value.result,
        value.payload,
        value.response,
        value.auth,
    ];


    for (const nested of nestedObjects) {
        const nestedId =
            extractUserId(nested);

        if (nestedId) {
            return nestedId;
        }
    }


    return null;
};


/* =========================================================
   GET USER ID FROM LOCAL STORAGE
========================================================= */

const getUserIdFromStorage = () => {

    /*
     * First scan known user keys.
     */
    for (const key of USER_STORAGE_KEYS) {
        const raw =
            localStorage.getItem(key);

        if (!raw) {
            continue;
        }


        /*
         * Sometimes localStorage directly contains
         * the ID as a string.
         */
        const directValue =
            raw.trim();

        if (
            directValue &&
            !directValue.startsWith("{") &&
            !directValue.startsWith("[")
        ) {
            /*
             * Avoid treating JWT as user ID.
             */
            if (
                directValue.split(".").length !== 3
            ) {
                return directValue;
            }
        }


        try {
            const parsed =
                JSON.parse(raw);

            const id =
                extractUserId(parsed);

            if (id) {
                return id;
            }

        } catch {
            /*
             * Ignore invalid JSON.
             */
        }
    }


    /*
     * Scan all localStorage entries as a final fallback.
     *
     * This helps when the login code uses a key that is
     * different from the expected keys.
     */
    for (let index = 0;
         index < localStorage.length;
         index++) {

        const key =
            localStorage.key(index);

        if (!key) {
            continue;
        }


        if (
            ACCESS_TOKEN_KEYS.includes(key) ||
            REFRESH_TOKEN_KEYS.includes(key)
        ) {
            continue;
        }


        const raw =
            localStorage.getItem(key);

        if (!raw) {
            continue;
        }


        try {
            const parsed =
                JSON.parse(raw);

            const id =
                extractUserId(parsed);

            if (id) {
                console.log(
                    "User ID found in localStorage key:",
                    key
                );

                return id;
            }

        } catch {
            /*
             * Not JSON, ignore.
             */
        }
    }


    return null;
};


/* =========================================================
   JWT DEBUG / USER ID FALLBACK
========================================================= */

const decodeJwtPayload = (token) => {
    try {
        if (
            typeof token !== "string" ||
            !token
        ) {
            return null;
        }


        const parts =
            token.split(".");


        if (parts.length !== 3) {
            return null;
        }


        const base64 =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");


        const padded =
            base64 +
            "=".repeat(
                (4 - (base64.length % 4)) % 4
            );


        const json =
            decodeURIComponent(
                atob(padded)
                    .split("")
                    .map(
                        (char) =>
                            "%" +
                            (
                                "00" +
                                char
                                    .charCodeAt(0)
                                    .toString(16)
                            ).slice(-2)
                    )
                    .join("")
            );


        return JSON.parse(json);

    } catch (error) {

        console.warn(
            "Could not decode JWT:",
            error
        );

        return null;
    }
};


const getUserIdFromToken = () => {

    const token =
        getAccessToken();


    if (!token) {
        return null;
    }


    const payload =
        decodeJwtPayload(token);


    if (!payload) {
        return null;
    }


    return (
        extractUserId(payload) ||
        payload.sub ||
        payload.user?.id ||
        payload.user?._id ||
        payload.user?.userId ||
        null
    );
};


/* =========================================================
   RESOLVE USER ID
========================================================= */

export const getCurrentUserId = () => {

    /*
     * Priority 1:
     * localStorage user object
     */
    const storageUserId =
        getUserIdFromStorage();


    if (storageUserId) {
        return storageUserId;
    }


    /*
     * Priority 2:
     * JWT payload
     */
    const tokenUserId =
        getUserIdFromToken();


    if (tokenUserId) {
        return String(tokenUserId);
    }


    return null;
};


/* =========================================================
   DEBUG AUTH STATE
========================================================= */

export const debugAuthState = () => {

    const token =
        getAccessToken();

    const userId =
        getCurrentUserId();

    console.log(
        "========== AUTH DEBUG =========="
    );

    console.log(
        "Access token exists:",
        Boolean(token)
    );

    console.log(
        "Resolved userId:",
        userId
    );

    if (token) {
        console.log(
            "JWT payload:",
            decodeJwtPayload(token)
        );
    }

    console.log(
        "LocalStorage keys:",
        Object.keys(localStorage)
    );

    console.log(
        "================================="
    );

    return {
        hasToken: Boolean(token),
        userId,
    };
};


/* =========================================================
   AXIOS AI CLIENT
========================================================= */

const aiClient = axios.create({
    baseURL: AI_BASE_URL,

    withCredentials: true,

    timeout: 30000,

    headers: {
        "Content-Type": "application/json",
    },
});


/* =========================================================
   REFRESH LOCK
========================================================= */

let refreshPromise = null;


/* =========================================================
   REFRESH ACCESS TOKEN
========================================================= */

const refreshAccessToken = async () => {

    if (refreshPromise) {
        return refreshPromise;
    }


    refreshPromise = (async () => {

        try {

            const refreshToken =
                getRefreshToken();


            const config = {
                withCredentials: true,

                headers: {
                    "Content-Type":
                        "application/json",
                },
            };


            if (refreshToken) {
                config.headers.Authorization =
                    `Bearer ${refreshToken}`;
            }


            const response =
                await axios.post(
                    `${MAIN_API_URL}/api/user/refresh-token`,
                    {},
                    config
                );


            const newAccessToken =
                response?.data?.data?.accessToken ||
                response?.data?.data?.accesstoken ||
                response?.data?.data?.access_token ||
                response?.data?.data?.token ||
                response?.data?.accessToken ||
                response?.data?.accesstoken ||
                response?.data?.access_token ||
                response?.data?.token ||
                "";


            if (
                typeof newAccessToken !== "string" ||
                !newAccessToken.trim()
            ) {

                console.error(
                    "Refresh succeeded but no access token returned."
                );

                return null;
            }


            const saved =
                saveAccessToken(
                    newAccessToken.trim()
                );


            if (!saved) {
                return null;
            }


            /*
             * Important:
             * After refreshing token, user ID may now be
             * available from the new JWT.
             */
            const newUserId =
                getUserIdFromToken();


            if (newUserId) {
                console.log(
                    "User ID from refreshed token:",
                    newUserId
                );
            }


            console.log(
                "Access token refreshed successfully."
            );


            return newAccessToken.trim();

        } catch (error) {

            console.error(
                "Refresh error:",
                error?.response?.data ||
                error?.message ||
                error
            );

            return null;

        } finally {

            refreshPromise = null;
        }

    })();


    return refreshPromise;
};


/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

aiClient.interceptors.request.use(
    (config) => {

        const token =
            getAccessToken();


        if (!config.headers) {
            config.headers = {};
        }


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        } else {

            delete config.headers.Authorization;
        }


        return config;
    },


    (error) => {
        return Promise.reject(error);
    }
);


/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

aiClient.interceptors.response.use(
    (response) => response,


    async (error) => {

        const originalRequest =
            error?.config;


        if (!originalRequest) {
            return Promise.reject(error);
        }


        if (
            error?.response?.status !== 401
        ) {
            return Promise.reject(error);
        }


        if (originalRequest._retry) {

            console.error(
                "AI request still unauthorized after refresh.",
                error?.response?.data
            );

            return Promise.reject(error);
        }


        originalRequest._retry = true;


        try {

            const newAccessToken =
                await refreshAccessToken();


            if (!newAccessToken) {

                clearAuthTokens();

                return Promise.reject(error);
            }


            if (!originalRequest.headers) {
                originalRequest.headers = {};
            }


            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;


            if (
                typeof originalRequest.headers.set ===
                "function"
            ) {

                originalRequest.headers.set(
                    "Authorization",
                    `Bearer ${newAccessToken}`
                );
            }


            return aiClient.request(
                originalRequest
            );

        } catch (refreshError) {

            return Promise.reject(
                refreshError
            );
        }
    }
);


/* =========================================================
   RESPONSE UNWRAPPER
========================================================= */

const unwrap = (response) => {

    let data =
        response?.data ?? response;


    /*
     * Handle:
     *
     * { data: {...} }
     */
    if (
        data &&
        typeof data === "object" &&
        data.data !== undefined
    ) {
        data = data.data;
    }


    if (typeof data === "string") {

        try {
            data = JSON.parse(data);
        } catch {
            return {
                success: false,
                message: data,
            };
        }
    }


    return data || {};
};


/* =========================================================
   AI API
========================================================= */

export const aiApi = {

    /* =====================================================
       HEALTH
    ===================================================== */

    health: async () => {

        const response =
            await aiClient.get(
                "/health"
            );

        return unwrap(response);
    },


    /* =====================================================
       PRODUCTS
    ===================================================== */

    products: async (
        search = "",
        limit = 100
    ) => {

        const response =
            await aiClient.get(
                "/api/ai/products",
                {
                    params: {
                        search,
                        limit,
                    },
                }
            );

        return unwrap(response);
    },


    /* =====================================================
       COPILOT
    ===================================================== */

    copilot: async (
        message,
        userId = null
    ) => {

        let cleanMessage = "";


        if (
            message &&
            typeof message === "object"
        ) {

            cleanMessage =
                message.message ??
                message.text ??
                message.content ??
                "";

        } else {

            cleanMessage =
                String(message || "");
        }


        cleanMessage =
            cleanMessage.trim();


        if (!cleanMessage) {

            throw new Error(
                "Please enter a grocery request."
            );
        }


        const finalUserId =
            userId ||
            getCurrentUserId();


        const payload = {
            message: cleanMessage,
        };


        if (finalUserId) {
            payload.userId = finalUserId;
        }


        const response =
            await aiClient.post(
                "/api/ai/copilot",
                payload
            );


        return unwrap(response);
    },


    /* =====================================================
       SHOPPING COPILOT
    ===================================================== */

    shoppingCopilot: async (
        message,
        userId = null
    ) => {

        let cleanMessage = "";


        if (
            message &&
            typeof message === "object"
        ) {

            cleanMessage =
                message.message ??
                message.text ??
                message.content ??
                "";

        } else {

            cleanMessage =
                String(message || "");
        }


        cleanMessage =
            cleanMessage.trim();


        if (!cleanMessage) {

            throw new Error(
                "Please enter a grocery request."
            );
        }


        const finalUserId =
            userId ||
            getCurrentUserId();


        const payload = {
            message: cleanMessage,
        };


        if (finalUserId) {
            payload.userId = finalUserId;
        }


        const response =
            await aiClient.post(
                "/api/ai/copilot/shopping",
                payload
            );


        return unwrap(response);
    },


    /* =====================================================
       CHEAPEST BASKET
    ===================================================== */

    cheapestBasket: async (
        payload = {}
    ) => {

        const response =
            await aiClient.post(
                "/api/ai/cheapest-basket",
                payload
            );

        return unwrap(response);
    },


    /* =====================================================
       RECOMMENDATIONS
    ===================================================== */

    recommendations: async (
        limit = 8
    ) => {

        const token =
            getAccessToken();


        if (!token) {

            throw new Error(
                "Access token not found. Please login again."
            );
        }


        const response =
            await aiClient.post(
                "/api/ai/recommendations",
                {
                    limit,
                }
            );


        return unwrap(response);
    },


    /* =====================================================
       SMART REFILL
    ===================================================== */

    smartRefill: async (
        userId = null
    ) => {

        /*
         * Resolve user ID from:
         *
         * 1. Function argument
         * 2. localStorage
         * 3. JWT
         */
        const finalUserId =
            userId ||
            getCurrentUserId();


        if (!finalUserId) {

            console.error(
                "Smart refill: User ID not found."
            );


            /*
             * Helpful debug information.
             */
            debugAuthState();


            throw new Error(
                "User ID not found. Please login again."
            );
        }


        console.log(
            "Smart refill userId:",
            finalUserId
        );


        const response =
            await aiClient.post(
                "/api/ai/smart-refill",
                {
                    userId: finalUserId,
                }
            );


        console.log(
            "Smart refill response:",
            response?.data
        );


        return unwrap(response);
    },


    /* =====================================================
       FORGOT SOMETHING
    ===================================================== */

    forgotSomething: async (
        cartProductIds = []
    ) => {

        const response =
            await aiClient.post(
                "/api/ai/forgot-something",
                {
                    cartProductIds,
                }
            );

        return unwrap(response);
    },


    /* =====================================================
       RECIPES
    ===================================================== */

    recipes: async (
        ingredients = [],
        budget = null
    ) => {

        const response =
            await aiClient.post(
                "/api/ai/recipes",
                {
                    ingredients,
                    budget,
                }
            );

        return unwrap(response);
    },


    /* =====================================================
       HEALTHY BASKET
    ===================================================== */

    healthyBasket: async (
        payload = {}
    ) => {

        const response =
            await aiClient.post(
                "/api/ai/healthy-basket",
                payload
            );

        return unwrap(response);
    },


    /* =====================================================
       SUBSTITUTION
    ===================================================== */
substitution: async (productId) => {
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    console.log("SUBSTITUTION REQUEST:", {
        baseURL: AI_BASE_URL,
        url: "/api/ai/substitution",
        productId,
    });

    const response = await aiClient.post(
        "/api/ai/substitution",
        {
            productId,
        }
    );

    return unwrap(response);
},


    /* =====================================================
       DYNAMIC PRICING
    ===================================================== */
dynamicPricing: async (productId, extra = {}) => {
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    console.log("DYNAMIC PRICING REQUEST:", {
        baseURL: AI_BASE_URL,
        url: "/api/ai/dynamic-pricing",
        productId,
    });

    const response = await aiClient.post(
        "/api/ai/dynamic-pricing",
        {
            productId,
            ...extra,
        }
    );

    return unwrap(response);
},
   

    /* =====================================================
       DEMAND FORECAST
    ===================================================== */
demandForecast: async (productId, horizon = 7) => {
    if (!productId) {
        throw new Error("Product ID is required.");
    }

    console.log("DEMAND FORECAST REQUEST:", {
        baseURL: AI_BASE_URL,
        url: "/api/ai/demand-forecast",
        productId,
        horizon,
    });

    const response = await aiClient.post(
        "/api/ai/demand-forecast",
        {
            productId,
            horizon,
        }
    );

    return unwrap(response);
},
   

    /* =====================================================
       INVENTORY INTELLIGENCE
    ===================================================== */

    inventoryIntelligence: async () => {

        const response =
            await aiClient.get(
                "/api/ai/inventory-intelligence"
            );

        return unwrap(response);
    },


    /* =====================================================
       EXPIRY INTELLIGENCE
    ===================================================== */

    expiryIntelligence: async (
        productId,
        expiryDays
    ) => {

        if (!productId) {

            throw new Error(
                "Product ID is required."
            );
        }


        const response =
            await aiClient.post(
                "/api/ai/expiry-intelligence",
                {
                    productId,
                    expiryDays,
                }
            );


        return unwrap(response);
    },


    /* =====================================================
       ETA
    ===================================================== */

    eta: async (
        payload = {}
    ) => {

        const response =
            await aiClient.post(
                "/api/ai/eta",
                payload
            );

        return unwrap(response);
    },


    /* =====================================================
       COMMAND CENTER
    ===================================================== */

    commandCenter: async () => {

        const response =
            await aiClient.get(
                "/api/ai/admin/command-center"
            );

        return unwrap(response);
    },


    /* =====================================================
       FRIDGE VISION
    ===================================================== */

    fridgeScan: async (
        formData
    ) => {

        if (!formData) {

            throw new Error(
                "FormData is required."
            );
        }


        const response =
            await aiClient.post(
                "/api/ai/vision/fridge",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );


        return unwrap(response);
    },
};


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default aiApi;
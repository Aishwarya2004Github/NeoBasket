import Axios from "./Axios"
import SummaryApi from "../common/SummaryApi"

const fetchUserDetails = async () => {
    try {
        const response = await Axios({
            ...SummaryApi.userDetails
        })

        console.log("USER DETAILS RESPONSE =", response.data)

        return response.data

    } catch (error) {
        console.log("FETCH USER ERROR =", error.response?.data)
        return null
    }
}

export default fetchUserDetails
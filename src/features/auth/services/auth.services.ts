import API from "@/config/api/api"
import usePostData from "@/hooks/use-post-data"

export const useLogin = () => {
    return usePostData({ url: API.auth.login })
}




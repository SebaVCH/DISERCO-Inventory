import {useQuery} from "@tanstack/react-query";
import userAPI from "../services/userService.ts";

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: userAPI.getUsers
    })
}
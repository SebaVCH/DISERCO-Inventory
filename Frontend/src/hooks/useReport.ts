import { useQuery } from "@tanstack/react-query";
import reportAPI from "../services/reportService.ts";

export const useReports = () => {
    return useQuery({
        queryKey: ['reports'],
        queryFn: reportAPI.getReports
    });
};

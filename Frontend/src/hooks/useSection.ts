import {useQuery} from "@tanstack/react-query";
import sectionAPI from "../services/sectionService.ts";

export const useSection = () => {
    return useQuery({
        queryKey: ['section'],
        queryFn: sectionAPI.getSections
    })
}

export const useUndeletedSection = () => {
    return useQuery({
        queryKey: ['undeletedSection'],
        queryFn: sectionAPI.getUndeletedSections
    })
}
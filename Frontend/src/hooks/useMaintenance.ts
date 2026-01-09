import {useQuery} from "@tanstack/react-query";
import maintenanceAPI from "../services/maintenanceService.ts";

export const useMaintenance = () => {
    return useQuery({
        queryKey: ['maintenance'],
        queryFn: maintenanceAPI.getMaintenances
    })
}


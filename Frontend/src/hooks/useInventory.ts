import {useQuery} from "@tanstack/react-query";
import inventoryAPI from "../services/inventoryService.ts";

export const useInventory = (status: 'all' | 'unhidden' | 'hidden' | 'critical' = 'all') => {
    return useQuery({
        queryKey: ['inventory', 'total', status],
        queryFn: () => inventoryAPI.getTotalInventory(status),
    });
};

export const useInventoryMovement = () => {
    return useQuery({
        queryKey: ['inventory', 'movement'],
        queryFn: inventoryAPI.getInventoryMovement,
    });
};
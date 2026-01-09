import {useQuery} from "@tanstack/react-query";
import inventoryAPI from "../services/inventoryService.ts";
export const useInventory = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryAPI.getTotalInventory,
    });
};

export const useCriticalInventory = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryAPI.getCriticalInventory,
    });
};

export const useInventoryMovement = () => {
    return useQuery({
        queryKey: ['inventory'],
        queryFn: inventoryAPI.getInventoryMovement,
    });
};
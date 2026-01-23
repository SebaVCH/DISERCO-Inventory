import { useState, useRef } from 'react';
import type { ColumnProps } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import type { Report } from "../types/report.ts";
import { useReports } from "../hooks/useReport.ts";
import reportAPI from "../services/reportService.ts";
import { useQueryClient } from "@tanstack/react-query";
import CrudDataTable, { type CrudDataTableConfig } from "../components/crudDataTable.tsx";
import useUserStore from "../store/useUserStore.ts";

function ReportPage() {
    const { data: reports = [] } = useReports();
    const [isDownloading, setIsDownloading] = useState(false);
    const [dates, setDates] = useState<Date[] | null>(null);
    const toast = useRef<Toast>(null);
    const queryClient = useQueryClient();
    const { user } = useUserStore();

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const handleDownload = async (report: Report) => {
        try {
            setIsDownloading(true);
            const blob = await reportAPI.downloadReport(report.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `reporte_${report.id}_${report.description || 'sin_titulo'}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.current?.show({ severity: 'success', summary: 'Exitoso', detail: 'Reporte descargado', life: 3000 });
        } catch (_error) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el reporte', life: 3000 });
        } finally {
            setIsDownloading(false);
        }
    };

    const generatedAtBodyTemplate = (rowData: Report) => formatDate(rowData.generated_at);
    const periodBodyTemplate = (rowData: Report) => `${formatDate(rowData.period_start)} - ${formatDate(rowData.period_end)}`;

    const columns: ColumnProps[] = [
        { field: 'user.full_name', header: 'Usuario', sortable: true, style: { minWidth: '16rem' } },
        { field: 'generated_at', header: 'Fecha de Generación', body: generatedAtBodyTemplate, sortable: true, style: { minWidth: '12rem' } },
        { header: 'Período', body: periodBodyTemplate, style: { minWidth: '16rem' } },
        { field: 'description', header: 'Descripción', sortable: true, style: { minWidth: '16rem' } },
        { field: 'frequency', header: 'Frecuencia', sortable: true, style: { minWidth: '16rem' } },
    ];

    const config: CrudDataTableConfig<Report> = {
        entityName: 'Reporte',
        entityNamePlural: 'Reportes',
        title: 'Gestión de Reportes',
        columns,
        dialogContent: (item, submitted, onInputChange) => (
            <div className="flex flex-column gap-3">
                <div className="flex flex-column gap-2">
                    <label htmlFor="description">Descripción</label>
                    <InputText
                        id="description"
                        name="description"
                        value={item.description ?? ''}
                        onChange={(e) => onInputChange(e as any, 'description')}
                        placeholder="Descripción del reporte"
                    />
                </div>
                <div className="flex flex-column gap-2">
                    <label>Frecuencia</label>
                    <InputText value="manual" disabled readOnly />
                </div>
                <div className="flex flex-column gap-2">
                    <label>Rango de fechas</label>
                    <Calendar
                        value={dates as any}
                        onChange={(e) => setDates(e.value as Date[] | null)}
                        selectionMode="range"
                        readOnlyInput
                        hideOnRangeSelection
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                    {submitted && (!dates || dates.length !== 2) && (
                        <small className="p-error">Seleccione un rango de fechas</small>
                    )}
                </div>
            </div>
        ),
        getItemDisplayName: (item) => item.description || `#${item.id}`,
        emptyItem: {
            id: 0,
            description: '',
            items: [],
            generated_at: '',
            period_start: '',
            period_end: '',
            frequency: 'manual',
        },
        initialData: reports,
        validateItem: () => {
            if (!user?.id) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Debe iniciar sesión para crear reportes', life: 3000 });
                return false;
            }
            if (!dates || dates.length !== 2 || !dates[0] || !dates[1]) {
                toast.current?.show({ severity: 'warn', summary: 'Rango requerido', detail: 'Seleccione un rango de fechas', life: 3000 });
                return false;
            }
            if (dates[0] > dates[1]) {
                toast.current?.show({ severity: 'warn', summary: 'Rango inválido', detail: 'La fecha inicial debe ser anterior a la final', life: 3000 });
                return false;
            }
            return true;
        },
        onSaveItem: async (item, isNew) => {
            if (!isNew) return item;
            if (!user?.id) throw new Error('Usuario no autenticado');
            if (!dates || dates.length !== 2) throw new Error('Rango de fechas incompleto');

            const [start, end] = dates;
            const saved = await reportAPI.createReport({
                user_id: user.id,
                frequency: 'manual',
                description: item.description || undefined,
                period_start: start.toISOString(),
                period_end: end.toISOString(),
                generated_at: new Date().toISOString(),
            });

            setDates(null);
            await queryClient.invalidateQueries({ queryKey: ['reports'] });
            return saved;
        },
        onDeleteItem: async (id: number) => {
            await reportAPI.deleteReport(id);
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
        enableEditAction: false,
        enableCreateAction: true,
        additionalActions: (rowData) => (
            <Button
                icon="pi pi-download"
                rounded
                outlined
                severity="info"
                onClick={() => handleDownload(rowData)}
                disabled={isDownloading}
                tooltip="Descargar reporte"
                tooltipOptions={{ position: 'top' }}
            />
        ),
    };

    return (
        <div>
            <Toast ref={toast} />
            <CrudDataTable config={config} />
        </div>
    );
}

export default ReportPage;

import { useState, useRef } from 'react';
import type { ColumnProps } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import type { Report } from "../types/report.ts";
import { useReports } from "../hooks/useReport.ts";
import reportAPI from "../services/reportService.ts";
import { useQueryClient } from "@tanstack/react-query";
import CrudDataTable, { type CrudDataTableConfig } from "../components/crudDataTable.tsx";

function ReportPage() {
    const { data: reports = [] } = useReports();
    const [isDownloading, setIsDownloading] = useState(false);
    const toast = useRef<Toast>(null);
    const queryClient = useQueryClient();

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
        { field: 'description', header: 'Descripción', sortable: true, style: { minWidth: '16rem' } },
        { field: 'user.full_name', header: 'Usuario', sortable: true, style: { minWidth: '16rem' } },
        { field: 'generated_at', header: 'Fecha de Generación', body: generatedAtBodyTemplate, sortable: true, style: { minWidth: '12rem' } },
        { header: 'Período', body: periodBodyTemplate, style: { minWidth: '16rem' } },
    ];

    const config: CrudDataTableConfig<Report> = {
        entityName: 'Reporte',
        entityNamePlural: 'Reportes',
        title: 'Gestión de Reportes',
        columns,
        dialogContent: () => null,
        getItemDisplayName: (item) => item.description || `#${item.id}`,
        emptyItem: {
            id: 0,
            description: '',
            items: [],
            generated_at: '',
            period_start: '',
            period_end: '',
        },
        initialData: reports,
        validateItem: () => true,
        onDeleteItem: async (id: number) => {
            await reportAPI.deleteReport(id);
            queryClient.invalidateQueries({ queryKey: ['reports'] });
        },
        enableEditAction: false,
        enableCreateAction: false,
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

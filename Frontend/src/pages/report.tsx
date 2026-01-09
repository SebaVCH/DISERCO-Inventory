import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import type { Report } from "../types/report.ts";

function Report() {
    const [reports] = useState<Report[]>([
        {
            id: 1,
            description: "Reporte de inventario mensual",
            items: [],
            generated_at: "2026-01-09T10:00:00",
            period_start: "2026-01-01",
            period_end: "2026-01-31"
        },
        {
            id: 2,
            description: "Reporte de mantenimiento trimestral",
            items: [],
            generated_at: "2026-01-08T15:30:00",
            period_start: "2025-10-01",
            period_end: "2025-12-31"
        }
    ]);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Report[]>>(null);

    const actionBodyTemplate = () => {
        return (
            <Button
                icon="pi pi-download"
                rounded
                outlined
                severity="info"
                onClick={() => console.log('Descargando reporte')}
                tooltip="Descargar reporte"
                tooltipOptions={{ position: 'top' }}
            />
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const generatedAtBodyTemplate = (rowData: Report) => {
        return formatDate(rowData.generated_at);
    };

    const periodBodyTemplate = (rowData: Report) => {
        return `${formatDate(rowData.period_start)} - ${formatDate(rowData.period_end)}`;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Gestión de Reportes</h4>
            <IconField iconPosition="left">
                <InputIcon className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="Buscar..."
                    onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        setGlobalFilter(target.value);
                    }}
                />
            </IconField>
        </div>
    );

    return (
        <div>
            <Toast ref={toast} />
            <div className="card">
                <DataTable
                    ref={dt}
                    value={reports}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} reportes"
                    globalFilter={globalFilter}
                    header={header}
                >
                    <Column
                        field="description"
                        header="Descripción"
                        sortable
                        style={{ minWidth: '16rem' }}
                    />
                    <Column
                        field="generated_at"
                        header="Fecha de Generación"
                        body={generatedAtBodyTemplate}
                        sortable
                        style={{ minWidth: '12rem' }}
                    />
                    <Column
                        header="Período"
                        body={periodBodyTemplate}
                        style={{ minWidth: '16rem' }}
                    />
                    <Column
                        header="Acciones"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ minWidth: '8rem' }}
                    />
                </DataTable>
            </div>
        </div>
    );
}

export default Report;

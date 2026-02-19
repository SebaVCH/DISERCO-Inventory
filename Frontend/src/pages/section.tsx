import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import CrudDataTable from '../components/crudDataTable.tsx';
import type { CrudDataTableConfig } from '../components/crudDataTable.tsx';
import type { Section } from '../types/section';
import {useSection} from "../hooks/useSection.ts";
import {useEffect, useState} from "react";
import {Message} from "primereact/message";
import sectionAPI from "../services/sectionService.ts";
import { useQueryClient } from "@tanstack/react-query";

const emptySection: Section = {
    id: 0,
    name: "",
};

function SectionPage() {
    const queryClient = useQueryClient();
    const { data, isLoading, isError } = useSection()
    const [sections, setSection] = useState<Section[]>([]);

    useEffect(() => {
        if (data) {
            setSection(data);
        }
    }, [data]);

    const config: CrudDataTableConfig<Section> = {
        entityName: 'Sección',
        entityNamePlural: 'Secciones',
        title: 'Gestión de secciones',
        columns: [
            { field: 'id', header: 'Código', sortable: true, style: { minWidth: '6rem' } },
            { field: 'name', header: 'Nombre', sortable: true, style: { minWidth: '16rem' } },
        ],
        dialogContent: (section, submitted, onInputChange) => (
            <div className="field">
                <label htmlFor="name" className="font-bold">Nombre</label>
                <InputText
                    id="name"
                    value={section.name}
                    onChange={(e) => onInputChange(e, 'name')}
                    required
                    autoFocus
                    className={classNames({ 'p-invalid': submitted && !section.name })}
                />
                {submitted && !section.name && <small className="p-error">El nombre es requerido.</small>}
            </div>
        ),
        getItemDisplayName: (section) => section.name,
        emptyItem: emptySection,
        initialData: sections,
        validateItem: (section) => section.name.trim() !== '',
        isLoading: isLoading,
        skeletonRows: 4,
        onSaveItem: async (section, isNew) => {
            if (isNew) {
                const created = await sectionAPI.createSection({ name: section.name });
                await queryClient.invalidateQueries({ queryKey: ['section'] });
                return created;
            }
            await sectionAPI.updateSection(section.id, { name: section.name });
            await queryClient.invalidateQueries({ queryKey: ['section'] });
            return { ...section };
        },
        onDeleteItem: async (id) => {
            await sectionAPI.deleteSection(id);
            await queryClient.invalidateQueries({ queryKey: ['section'] });
        },
    };


    if (isError) {
        return <Message severity="error" text="Error al cargar el inventario" />;
    }

    return <CrudDataTable config={config} />;
}

export default SectionPage;
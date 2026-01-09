import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import CrudDataTable from '../components/crudDataTable.tsx';
import type { CrudDataTableConfig } from '../components/crudDataTable.tsx';
import type { Section } from '../types/section';

const initialSections: Section[] = [
    {
        id: 1,
        name: "Areas Verdes",
    },
    {
        id: 2,
        name: "Alumbrado",
    }
];

const emptySection: Section = {
    id: 0,
    name: "",
};

function SectionPage() {
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
        initialData: initialSections,
        validateItem: (section) => section.name.trim() !== '',
    };

    return <CrudDataTable config={config} />;
}

export default SectionPage;
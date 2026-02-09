import { Skeleton } from 'primereact/skeleton';

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

const TableSkeleton = ({ rows = 6, columns = 4 }: TableSkeletonProps) => {
    const rowArray = Array.from({ length: rows });
    const colArray = Array.from({ length: columns });

    return (
        <div className="page-skeleton">
            <div className="page-skeleton__toolbar">
                <Skeleton width="12rem" height="2.25rem" />
                <Skeleton width="10rem" height="2.25rem" />
                <Skeleton width="8rem" height="2.25rem" />
            </div>
            <div className="page-skeleton__table">
                {rowArray.map((_, rowIndex) => (
                    <div key={rowIndex} className="page-skeleton__row">
                        {colArray.map((_, colIndex) => (
                            <Skeleton key={colIndex} height="1.5rem" width={`${16 - colIndex * 2}rem`} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSkeleton;


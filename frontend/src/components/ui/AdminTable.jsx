import { Inbox } from 'lucide-react';

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const AdminTable = ({
    columns,
    rows,
    getRowKey,
    emptyMessage,
    emptyAction,
    emptyIcon: EmptyIcon = Inbox,
    footer,
    minWidth = '760px',
    className = '',
    rowClassName = '',
}) => {
    const hasRows = rows.length > 0;

    return (
        <div className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-sm ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth }}>
                    <thead className="border-b border-border bg-surface-alt">
                        <tr>
                            {columns.map(column => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={[
                                        'px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary',
                                        alignClasses[column.align || 'left'],
                                        column.headerClassName,
                                    ].filter(Boolean).join(' ')}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={getRowKey(row, index)}
                                className={[
                                    'border-b border-border transition-colors last:border-0 hover:bg-surface-alt/50',
                                    typeof rowClassName === 'function' ? rowClassName(row, index) : rowClassName,
                                ].filter(Boolean).join(' ')}
                            >
                                {columns.map(column => (
                                    <td
                                        key={column.key}
                                        className={[
                                            'px-4 py-3',
                                            alignClasses[column.align || 'left'],
                                            column.cellClassName,
                                        ].filter(Boolean).join(' ')}
                                    >
                                        {column.render ? column.render(row, index) : row[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!hasRows && (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-14 text-center text-sm font-medium text-text-muted">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-alt">
                        <EmptyIcon className="h-6 w-6 opacity-60" />
                    </div>
                    <p>{emptyMessage}</p>
                    {emptyAction}
                </div>
            )}

            {footer && (
                <div className="border-t border-border bg-surface-alt/40 px-4 py-3 text-xs text-text-muted">
                    {footer}
                </div>
            )}
        </div>
    );
};

const AdminTableAction = ({ icon: Icon, label, tone = 'default', className = '', ...props }) => {
    const toneClassName = {
        default: 'text-text-secondary hover:bg-surface-alt',
        primary: 'text-primary hover:bg-primary/10',
        success: 'text-success hover:bg-success/10',
        warning: 'text-warning hover:bg-warning/10',
        danger: 'text-error hover:bg-error/10',
    }[tone] || 'text-text-secondary hover:bg-surface-alt';

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${toneClassName} ${className}`}
            {...props}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
};

const AdminStatusBadge = ({ children, tone = 'default', dot = false }) => {
    const toneClassName = {
        default: 'bg-surface-alt text-text-secondary',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        danger: 'bg-error/10 text-error',
        primary: 'bg-primary/10 text-primary',
    }[tone] || 'bg-surface-alt text-text-secondary';

    const dotClassName = {
        default: 'bg-text-muted',
        success: 'bg-success',
        warning: 'bg-warning',
        danger: 'bg-error',
        primary: 'bg-primary',
    }[tone] || 'bg-text-muted';

    return (
        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${toneClassName}`}>
            {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotClassName}`} />}
            {children}
        </span>
    );
};

AdminTable.Action = AdminTableAction;
AdminTable.StatusBadge = AdminStatusBadge;

export default AdminTable;

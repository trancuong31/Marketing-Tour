import { Inbox, Loader2 } from 'lucide-react';

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
    scrollable = false,
    loading = false,
}) => {
    const hasRows = rows.length > 0;
    const shellClassName = [
        'relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm',
        scrollable && 'flex min-h-0 flex-col',
        className,
    ].filter(Boolean).join(' ');
    const tableWrapClassName = scrollable && hasRows ? 'min-h-0 flex-1 overflow-auto' : 'overflow-x-auto';
    const headerCellClassName = scrollable ? 'sticky top-0 z-10 bg-surface-alt shadow-[0_1px_0_var(--color-border)]' : '';

    return (
        <div className={shellClassName} aria-busy={loading}>
            <div className={[tableWrapClassName, 'relative'].filter(Boolean).join(' ')}>
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
                                        headerCellClassName,
                                        column.headerClassName,
                                    ].filter(Boolean).join(' ')}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={loading && hasRows ? 'opacity-60' : ''}>
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

                {loading && (
                    <div className="absolute inset-x-0 bottom-0 top-[45px] z-20 flex items-center justify-center bg-surface/65 backdrop-blur-[1px]">
                        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải...
                        </div>
                    </div>
                )}
            </div>

            {!hasRows && !loading && (
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

const AdminTableAction = ({ icon: Icon, label, tone = 'default', className = '', compact = false, ...props }) => {
    const toneClassName = {
        default: 'text-text-secondary hover:text-text',
        primary: 'text-primary hover:text-primary-dark',
        success: 'text-success hover:text-success/80',
        warning: 'text-warning hover:text-warning/80',
        danger: 'text-error hover:text-error/80',
    }[tone] || 'text-text-secondary hover:bg-surface-alt';

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={[
                'inline-flex items-center justify-center rounded-full transition',
                compact ? 'p-1' : 'p-1.5',
                'hover:bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20',
                'disabled:cursor-not-allowed disabled:opacity-60',
                toneClassName,
                className,
            ].filter(Boolean).join(' ')}
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

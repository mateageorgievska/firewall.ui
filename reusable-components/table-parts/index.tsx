import classnames from 'classnames'
import { PropsWithChildren } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

type GeneralProps = {
	align?: 'left' | 'right' | 'center'
	bordered?: boolean
}

type TableProps = PropsWithChildren<GeneralProps>

type TableRowProps = TableProps & {
	striped?: boolean
	hover?: boolean
	highlight?: boolean
	onClick?: () => void
}

type TableColumnProps = TableProps & {
	colSpan?: number
}

type TableHeaderColumnProps = TableProps & {
	sortable?: boolean
	sortDir?: boolean | string
	colSpan?: number
	onToggleSorting?: (event: unknown) => void
}

export const TableFrame = (props: TableProps) => {
	const { children, bordered, ...rest } = props

	return (
		<div className="overflow-x-auto h-full overflow-y-hidden table-auto">
			<table
				className={classnames('w-full text-pSmall text-left', {
					'rounded border border-gray-200 ': bordered
				})}
				{...rest}
				role="grid"
			>
				{children}
			</table>
		</div>
	)
}

export const TableHeader = (props: TableProps) => {
	const { children, bordered, ...rest } = props
	return (
		<thead
			className={classnames(
				'font-lato text-s font-medium text-gray-500 px-6 py-6 uppercase bg-gray-50',
				{
					'border-b border-light-border': bordered
				}
			)}
			{...rest}
		>
			{children}
		</thead>
	)
}

export const TableBody = (props: TableProps) => {
	const { children, ...rest } = props

	return (
		<tbody className="font-montserrat text-gray-500 " {...rest}>
			{children}
		</tbody>
	)
}

export const TableRow = (props: TableRowProps) => {
	const { children, align, hover, bordered, onClick, highlight = false, ...rest } = props

	return (
		<tr
			className={classnames('', {
				'text-left': align === 'left' || !align,
				'text-right': align === 'right',
				'text-center': align === 'center',
				'hover:bg-table-cell': hover && !highlight,
				'border-b border-gray-200': bordered,
				'bg-red-150 text-gray-50': highlight,
				'even:bg-table-cell': !highlight
			})}
			onClick={onClick}
			{...rest}
		>
			{children}
		</tr>
	)
}

export const TableHeaderRow = (props: TableProps) => {
	const { children, ...rest } = props
	return <tr {...rest}>{children}</tr>
}

export const TableHeaderColumn = (props: TableHeaderColumnProps) => {
	const { children, align, sortable, sortDir, colSpan, onToggleSorting, bordered, ...rest } =
		props

	return (
		<th
			scope="col"
			className={classnames('p-[12px]', {
				'cursor-pointer': sortable,
				'border border-light-border': bordered
			})}
			colSpan={colSpan}
			onClick={onToggleSorting}
			{...rest}
		>
			<div
				className={classnames('flex items-center', {
					'justify-left': align === 'left' || !align,
					'justify-right': align === 'right',
					'justify-center': align === 'center'
				})}
			>
				{children}
				{sortable ? (
					sortDir && sortDir === 'desc' ? (
						<FiChevronDown className="w-4 h-4 ml-2 text-light-text" />
					) : sortDir && sortDir === 'asc' ? (
						<FiChevronUp className="w-4 h-4 ml-2 text-light-text" />
					) : null
				) : null}
			</div>
		</th>
	)
}

export const TableColumn = (props: TableColumnProps) => {
	const { children, align, colSpan, ...rest } = props

	return (
		<td
			className={classnames('p-[12px] ', {
				'text-left': align === 'left' || !align,
				'text-right': align === 'right',
				'text-center': align === 'center'
			})}
			colSpan={colSpan}
			{...rest}
		>
			{children}
		</td>
	)
}

export const TableData = (props: TableColumnProps) => {
	const { children, align, colSpan, ...rest } = props

	return (
		<td
			className={classnames('p-[10px]', {
				'text-left': align === 'left' || !align,
				'text-right': align === 'right',
				'text-center': align === 'center'
			})}
			colSpan={colSpan}
			{...rest}
		>
			{children}
		</td>
	)
}

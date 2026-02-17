/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'
import classnames from 'classnames'
import SelectFilter from '../../components/general/form/SelectFilter'
import { Option } from '../../interfaces/Classifier'
import { useIntl } from 'react-intl'

const pages: Option[] = [
	{
		label: '10',
		value: '10'
	},
	{
		label: '20',
		value: '20'
	},
	{
		label: '30',
		value: '30'
	},
	{
		label: '40',
		value: '40'
	},
	{
		label: '50',
		value: '50'
	}
]

type PaginationProps = {
	gotoPage: (value: number) => void
	previousPage: () => void
	nextPage: () => void
	canPreviousPage: boolean
	canNextPage: boolean
	setPageSize: (value: number) => void
	pageCount: number
	pageIndex: number
	pageSize: number
}

export const Pagination: React.FC<PaginationProps> = (props) => {
	const intl = useIntl()
	const {
		canNextPage,
		canPreviousPage,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		pageCount,
		pageIndex,
		pageSize
	} = props

	const onChange = (data: any) => {
		setPageSize(parseInt(data.value))
	}

	return (
		<div className="flex justify-between py-[12px] font-montserrat font-medium z-5">
			<div className="flex items-center">
				<span className="text-pSmall text-light-text dark:text-dark-text mr-4">
					{intl.formatMessage({
						defaultMessage: 'Showing rows per page',
						description: 'User to selects number of rows to appear on a page'
					})}
				</span>
				<SelectFilter
					setSelected={onChange}
					options={pages}
					placeholder={pageSize.toString()}
					placement="auto"
				/>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-pSmall text-light-text dark:text-dark-text mr-4">
					{pageIndex + 1}{' '}
					{intl.formatMessage({ defaultMessage: 'of', description: 'of' })} {pageCount}
				</span>
				<div className="flex justify-end">
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none"
						disabled={!canPreviousPage}
						onClick={() => gotoPage(0)}
					>
						<FiChevronsLeft
							className={classnames(' w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canPreviousPage,
								'text-light-form-placeholder opacity-40': !canPreviousPage
							})}
						/>
					</button>
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none "
						onClick={() => previousPage()}
						disabled={!canPreviousPage}
					>
						<FiChevronLeft
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canPreviousPage,
								'text-light-form-placeholder opacity-40': !canPreviousPage
							})}
						/>
					</button>

					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none "
						onClick={() => nextPage()}
						disabled={!canNextPage}
					>
						<FiChevronRight
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canNextPage,
								'text-light-form-placeholder opacity-40': !canNextPage
							})}
						/>
					</button>
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none"
						disabled={!canNextPage}
						onClick={() => gotoPage(pageCount - 1)}
					>
						<FiChevronsRight
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canNextPage,
								'text-light-form-placeholder opacity-40': !canNextPage
							})}
						/>
					</button>
				</div>
			</div>
		</div>
	)
}

export const PaginationServerSide: React.FC<PaginationProps> = (props) => {
	const intl = useIntl()
	const {
		canNextPage,
		canPreviousPage,
		gotoPage,
		nextPage,
		previousPage,
		setPageSize,
		pageCount,
		pageIndex,
		pageSize
	} = props

	const onChange = (data: any) => {
		setPageSize(parseInt(data.value))
	}

	return (
		<div className="flex justify-between py-[12px] font-montserrat font-medium z-5">
			<div className="flex items-center">
				<span className="text-pSmall text-light-text dark:text-dark-text mr-4">
					{intl.formatMessage({
						id:"num",
						defaultMessage: 'Showing rows per page',
						description: 'User to selects number of rows to appear on a page'
					})}
				</span>
				<SelectFilter
					setSelected={onChange}
					options={pages}
					placeholder={pageSize?.toString()}
					placement="auto"
				/>
			</div>
			<div className="flex justify-between items-center">
				<span className="text-pSmall text-light-text dark:text-dark-text mr-4">
					{pageIndex} {intl.formatMessage({id:"of", defaultMessage: 'of', description: 'of' })}{' '}
					{pageCount}
				</span>
				<div className="flex justify-end">
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none"
						disabled={!canPreviousPage}
						onClick={() => gotoPage(0)}
					>
						<FiChevronsLeft
							className={classnames(' w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canPreviousPage,
								'text-light-form-placeholder opacity-40': !canPreviousPage
							})}
						/>
					</button>
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none "
						onClick={() => previousPage()}
						disabled={!canPreviousPage}
					>
						<FiChevronLeft
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canPreviousPage,
								'text-light-form-placeholder opacity-40': !canPreviousPage
							})}
						/>
					</button>

					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none "
						onClick={() => nextPage()}
						disabled={!canNextPage}
					>
						<FiChevronRight
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canNextPage,
								'text-light-form-placeholder opacity-40': !canNextPage
							})}
						/>
					</button>
					<button
						type="button"
						className=" disabled:cursor-not-allowed focus:outline-none"
						disabled={!canNextPage}
						onClick={() => gotoPage(pageCount - 1)}
					>
						<FiChevronsRight
							className={classnames('w-[28px] h-[28px]', {
								'text-light-text dark:text-dark-text': canNextPage,
								'text-light-form-placeholder opacity-40': !canNextPage
							})}
						/>
					</button>
				</div>
			</div>
		</div>
	)
}

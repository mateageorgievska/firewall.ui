// import { useContext } from 'react'
import Select from 'react-select'
import classnames from 'classnames'
import { CustomStyles } from './styles'
import { FiAlertCircle } from 'react-icons/fi'
import makeAnimated from 'react-select/animated'

type InputSizes = 'sm' | 'md' | 'lg'

export type SelectData = {
	label: string | React.ReactNode
	value: string | number
}

export type SelectProps = {
	options: any[]
	name?: string
	label?: string
	error?: string
	size?: InputSizes
	disabled?: boolean
	onFocus?: () => void
	onBlur?: () => void
	placeholder?: string
	loading?: boolean
	success?: boolean
	isClearable?: boolean
	required?: boolean
}

type SingleProps = SelectProps & {
	defaultValue?: SelectData | unknown
	onChange?: (value: unknown) => void
	value?: SelectData | unknown
	onMenuOpen?: () => void
}

type MultipleProps = SelectProps & {
	defaultValue?: SelectData[] | unknown
	onChange?: (value: unknown) => void
	value?: SelectData | unknown
}

export const Single: React.FC<SingleProps> = (props) => {
	// const { theme } = useContext(ThemeContext)
	// const { color } = useContext(ColorContext)
	const {
		name,
		label,
		defaultValue,
		placeholder,
		onChange,
		disabled,
		size,
		error,
		options,
		success,
		loading,
		isClearable,
		value,
		onMenuOpen,
		required
	} = props

	return (
		<div className="">
			{label ? (
				<label
					htmlFor={name}
					className={classnames('block mb-[8px] font-lato font-medium', {
						'text-pSmall': size === 'sm',
						'text-pNormal': size === 'md' || !size || size === 'lg',
						'text-light-form-label dark:text-dark-form-label': !error && !success,
						'text-error': error,
						'text-success': success
					})}
				>
					{label} {required ? <span className="text-red-600 mt-4">*</span> : null}
				</label>
			) : null}
			<Select
				className={classnames('font-montserrat font-regular', {
					'text-pSmall': size === 'sm',
					'text-pNormal': size === 'md' || !size || size === 'lg'
				})}
				classNamePrefix="react-select"
				isDisabled={disabled}
				isLoading={loading}
				defaultValue={defaultValue}
				isClearable={isClearable}
				isSearchable
				options={options}
				placeholder={placeholder}
				instanceId="cdbehbvueifvb"
				onChange={onChange}
				name={name}
				id={name}
				styles={CustomStyles(size ?? 'md', error ?? '', success ?? false)}
				menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
				value={value}
				onMenuOpen={onMenuOpen}
				data-cy="select-box"
			/>
			{error ? (
				<div className="mt-[8px] items-center flex">
					<FiAlertCircle
						className={classnames('flex-shrink-0 inline mr-[4px] text-error', {
							'w-4 h-4': size === 'sm',
							'w-5 h-5': size === 'md' || !size || size === 'lg'
						})}
					/>
					<span
						className={classnames('font-montserrat font-regular text-error', {
							'text-pSmall': size === 'sm',
							'text-pNormal': size === 'md' || !size || size === 'lg'
						})}
					>
						{error}
					</span>
				</div>
			) : null}
		</div>
	)
}

export const Multiple: React.FC<MultipleProps> = (props) => {
	// const { theme } = useContext(ThemeContext)
	// const { color } = useContext(ColorContext)
	const {
		name,
		label,
		defaultValue,
		placeholder,
		onChange,
		disabled,
		size,
		error,
		options,
		success,
		loading,
		isClearable,
		value,
		required
	} = props

	return (
		<div className="">
			{label ? (
				<label
					htmlFor={name}
					className={classnames('block mb-[8px] font-lato font-medium', {
						'text-pSmall': size === 'sm',
						'text-pNormal': size === 'md' || !size || size === 'lg',
						'text-light-form-label dark:text-dark-form-label': !error && !success,
						'text-error': error,
						'text-success': success
					})}
				>
					{label} {required ? <span className="text-red-600 mt-4">*</span> : null}
				</label>
			) : null}
			<Select 
				className={classnames('font-montserrat font-regular', {
					'text-pSmall': size === 'sm',
					'text-pNormal': size === 'md' || !size || size === 'lg',
					'h-[40px] text-pSmall': size === 'sm',
					'h-[45px] text-pNormal': size === 'md' || !size,
					'h-[50px] text-pNormal': size === 'lg'
				})}
				isMulti
				classNamePrefix="react-select"
				isDisabled={disabled}
				isLoading={loading}
				defaultValue={defaultValue}
				isClearable={isClearable}
				isSearchable
				options={options}
				placeholder={placeholder}
				instanceId="ewewewewewew"
				onChange={onChange}
				name={name}
				id={name}
				styles={CustomStyles(size ?? 'md', error ?? '', success ?? false)}
				components={makeAnimated()}
				menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
				value={value}
				data-cy="select-box"
			/>
			{error ? (
				<div className="mt-[8px] items-center flex">
					<FiAlertCircle
						className={classnames('flex-shrink-0 inline mr-[4px] text-error', {
							'w-4 h-4': size === 'sm',
							'w-5 h-5': size === 'md' || !size || size === 'lg'
						})}
					/>
					<span
						className={classnames('font-montserrat font-regular text-error', {
							'text-pSmall': size === 'sm',
							'text-pNormal': size === 'md' || !size || size === 'lg'
						})}
					>
						{error}
					</span>
				</div>
			) : null}
		</div>
	)
}

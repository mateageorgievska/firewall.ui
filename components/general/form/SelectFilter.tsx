import React from 'react'
import Select, { StylesConfig } from 'react-select'
import { Option } from '../../../interfaces/Classifier'
import chroma from 'chroma-js'

interface Props {
	options: Option[]
	setSelected: (value: any) => void
	placeholder: string
	placement?: 'auto' | 'bottom' | 'top'
}

const customeStyles: StylesConfig = {
	control: (styles) => ({
		...styles,
		backgroundColor: 'white',
		boxShadow: 'none',
		border: 0,
		height: 47,
		minHeight: 35,
		borderRadius: 0
	}),
	option: (styles, { isDisabled, isFocused, isSelected }) => {
		const color = chroma('#0E172B')
		return {
			...styles,
			backgroundColor: isDisabled
				? undefined
				: isSelected
				? '#0E172B'
				: isFocused
				? color.alpha(0.1).css()
				: undefined,
			color: isDisabled
				? '#4c1cae'
				: isSelected
				? chroma.contrast(color, 'white') > 2
					? 'white'
					: 'black'
				: '#0E172B',
			cursor: isDisabled ? 'not-allowed' : 'default',
			fontWeight: 400,

			':active': {
				...styles[':active'],
				backgroundColor: !isDisabled
					? isSelected
						? '#0E172B'
						: color.alpha(0.3).css()
					: undefined
			}
		}
	}
}

const SelectFilter: React.FC<Props> = (props) => {
	const { options, placeholder, setSelected, placement } = props

	return (
		<Select
			options={options}
			styles={customeStyles}
			className="rounded-md text-sm font-lato text-gray-250 z-30"
			onChange={setSelected}
			placeholder={placeholder}
			components={{ IndicatorSeparator: () => null }}
			instanceId="sdlmskmkds"
			menuPlacement={placement}
		/>
	)
}

export default SelectFilter

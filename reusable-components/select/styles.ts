import { GroupBase, StylesConfig, CSSObjectWithLabel, ClearIndicatorProps } from "react-select";

export const CustomStyles = (
  size: "sm" | "md" | "lg",
  error: string,
  success: boolean,
  theme?: "light" | "dark"
): StylesConfig<any, boolean, GroupBase<any>> => {
  const primaryColor = "#3867AC";
  return {
   control: (base: CSSObjectWithLabel, { isFocused, isDisabled }) => ({
      ...base,
      minHeight: size === 'sm' ? '40px' : size === 'md' ? '48px' : '50px',
      boxShadow: 'none',
      borderRadius: '0px',
      borderColor: isFocused
        ? primaryColor
        : error
        ? '#B5241E'
        : success
        ? '#376A20'
        : theme === 'dark'
        ? '#2D2D2D'
        : '#DDE0E4',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      backgroundColor: isDisabled ? '#E5E7EB' : theme === 'dark' ? '#212021' : '#FEFEFE',
      color: theme === 'dark' ? '#D1D5DA' : '#0E172B',
      transition: 'border-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 150ms',
      '&:hover': {
        borderColor: primaryColor,
      },
    }),
    option: (base: CSSObjectWithLabel, { isDisabled }) => ({
      ...base,
      backgroundColor: theme === 'dark' ? '#212021' : '#FEFEFE',
      color: theme === 'dark' ? '#D1D5DA' : '#0E172B',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      borderRadius: '0px',
      '&:hover': {
        backgroundColor: primaryColor,
        color: '#FFFFFF',
      },
    }),
    multiValue: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: theme === 'dark' ? '' : '#F2F4F7',
      borderRadius: '0px',
    }),
    multiValueLabel: (base: CSSObjectWithLabel) => ({
      ...base,
      color: theme === 'dark' ? '#FFFFFF' : '#121212',
    }),
    multiValueRemove: (base: CSSObjectWithLabel) => ({
      ...base,
      color: theme === 'dark' ? '#FFFFFF' : '#121212',
      ':hover': {
        background: '#DC2726',
        color: '#FFFFFF',
      },
    }),
    menuList: (base: CSSObjectWithLabel) => ({
      ...base,
      backgroundColor: theme === 'dark' ? '#212021' : '#FEFEFE',
      borderRadius: '0px',
      fontFamily: 'Montserrat',
      fontSize: '13.5px',
    }),
    input: (base: CSSObjectWithLabel) => ({
      ...base,
      color: theme === 'dark' ? '#D1D5DA' : '#0E172B',
    }),
    singleValue: (base: CSSObjectWithLabel) => ({
      ...base,
      color: theme === 'dark' ? '#D1D5DA' : '#0E172B',
    }),
    menuPortal: (base: CSSObjectWithLabel) => ({
      ...base,
      zIndex: 9999,
    }),
  }
}

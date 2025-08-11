import React from "react";
import Select, { SingleValue, MultiValue } from "react-select";
import { observer } from "mobx-react-lite";
import { injectIntl, IntlShape } from "react-intl";
import classnames from "classnames";
import makeAnimated from "react-select/animated";
import { FiAlertCircle } from "react-icons/fi";
import { CustomStyles } from "./select/styles";
import { ActionMeta } from "react-select";

interface OptionType {
  label: string;
  value: any;
}

interface Props {
  data: any[];
  disabled?: boolean;
  nameField: string | number;
  label?: string;
  selected?: any;
  setSelected?: (value: any) => void;
  onClick?: () => void;
  loading?: boolean;
  intl: IntlShape;
  drawerUp?: boolean;
  noMarginTop?: boolean;
  placeholder?: string;
  required?: boolean;
  error?: string;
  isMulti?: boolean;
  success?: boolean;
  defaultValue?: any;
}

const SelectBox: React.FC<Props> = observer((props) => {
  const {
    data,
    disabled,
    nameField,
    label,
    selected,
    setSelected,
    loading,
    intl,
    placeholder,
    noMarginTop,
    required,
    error,
    isMulti = false,
    success,
    onClick,
    defaultValue,
  } = props;

  const options = Array.isArray(data)
    ? data.map((item) => ({
        label: item[nameField],
        value: item,
      }))
    : [];

  const selectedOption =
    options?.find(
      (option) => JSON.stringify(option.value) === JSON.stringify(selected)
    ) || null;

  const handleChange = (
    option: SingleValue<OptionType> | MultiValue<OptionType> | null,
    _actionMeta: ActionMeta<OptionType>
  ) => {
    if (!setSelected) return;

    if (isMulti) {
      const selectedValues = (option as MultiValue<OptionType>).map(
        (opt) => opt.value
      );
      setSelected(selectedValues);
    } else {
      setSelected((option as SingleValue<OptionType>)?.value ?? null);
    }
  };

  return (
    <div
      className={classnames("", { "mt-0": noMarginTop, "mt-4": !noMarginTop })}
    >
      {label && (
        <label
          htmlFor={nameField.toString()}
          className={classnames("block mb-[8px] font-lato font-medium", {
            "text-light-form-label": !error && !success,
            "text-error": error,
            "text-success": success,
          })}
        >
          {label} {required && <span className="text-red-600 mt-4">*</span>}
        </label>
      )}
      <div onClick={onClick ? onClick : undefined}>
        <Select
          className="font-montserrat font-regular"
          classNamePrefix="react-select"
          isDisabled={disabled}
          isLoading={loading}
          isClearable
          isSearchable
          options={options}
          placeholder={
            placeholder || intl.formatMessage({ defaultMessage: "Select ..." })
          }
          value={selectedOption} 
          onChange={handleChange}
          styles={CustomStyles("md", error ?? "", success ?? false)}
          components={makeAnimated()}
          isMulti={isMulti}
          menuPortalTarget={
            typeof window !== "undefined" ? document.body : null
          }
          defaultValue={defaultValue}
        />
      </div>
      {error && (
        <div className="mt-[8px] items-center flex">
          <FiAlertCircle className="flex-shrink-0 inline mr-[4px] text-error w-5 h-5" />
          <span className="font-montserrat font-regular text-error">
            {error}
          </span>
        </div>
      )}
    </div>
  );
});

export default injectIntl(SelectBox);

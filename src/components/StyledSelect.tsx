import React from "react";
import Select, { Props } from "react-select";

import theme from "../styles/theme";

// Source: https://react-select.com/styles
const styles = {
  // Wrapper
  container: (provided: Object) => ({
    ...provided,
    fontFamily: "inherit",
    fontSize: "0.9rem",
    margin: `${theme.spacing(0.5)} 0 0 0`,
    minHeight: 0,
    width: "100%",
  }),
  control: (provided: Object, state: { isFocused: boolean }) => ({
    ...provided,
    "&:hover": { borderColor: theme.colors.nearBlack },
    backgroundColor: theme.colors.white,
    borderColor: state.isFocused
      ? theme.colors.nearBlack
      : theme.colors.neutral,
    borderRadius: 0,
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: state.isFocused ? `0 0 0 1px ${theme.colors.nearBlack}` : "none",
    lineHeight: 1,
  }),
  // Placeholder (excluding down arrow)
  valueContainer: (provided: Object) => ({
    ...provided,
    fontFamily: "inherit",
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
  }),
  // Down arrow
  // indicatorsContainer: (provided: Object) => ({
  //   ...provided,
  // }),
  indicatorSeparator: (provided: Object) => ({
    ...provided,
    margin: 0,
  }),
  // User input
  input: (provided: Object) => ({
    ...provided,
    color: theme.colors.nearBlack,
    fontFamily: theme.fonts.body,
    fontSize: "inherit",
    "& input": {
      font: "inherit",
    },
  }),
  // List of options
  menu: (provided: Object) => {
    return {
      ...provided,
      borderRadius: 0,
      border: `1px solid ${theme.colors.neutral}`,
      boxShadow: "none",
      padding: 0,
    };
  },
  // Item
  option: (provided: Object, state: { isFocused: boolean }) => {
    return {
      ...provided,
      backgroundColor: state.isFocused ? theme.colors.mint : theme.colors.white,
      color: state.isFocused
        ? theme.colors.nearBlack
        : theme.colors.darkNeutral,
      padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
      width: `100%`,
    };
  },
};

const StyledSelect: React.FunctionComponent<Props> = ({ ...props }) => {
  // Note: debug menu styles with `defaultMenuIsOpen` prop
  return <Select styles={styles} {...props} />;
};

export default StyledSelect;

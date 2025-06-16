import React from 'react';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const RoleSelect = ({ value, onChange, options }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      select
      value={value} // Utilisez value comme la valeur de value
      onChange={handleChange}
      fullWidth
    >
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default RoleSelect;

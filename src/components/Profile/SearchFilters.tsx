import * as React from 'react'
import { MenuItem, InputLabel } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { Grid } from '@mui/material'

import CustomSelectStyles from '../../style/Common/CustomSelect.module.scss'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

export default function SearchFilters() {
  const [popularItems, setPopularItems] = React.useState('')
  const [allItems, setAllItems] = React.useState('')

  return (
    <>
      <Grid item xs={12} md={3}>
        <FormControl sx={{ minWidth: '100%' }}>
          <Select
            value={allItems}
            onChange={(event) => setAllItems(event.target.value as string)}
            className={CustomSelectStyles.customSelect}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            IconComponent={() => (
              <KeyboardArrowDownIcon
                className={CustomSelectStyles.iconDown}
                sx={{ top: '10px !important' }}
              />
            )}
            MenuProps={{ classes: { paper: 'globalDropdown' } }}
          >
            <MenuItem value=''>
              <span className={CustomSelectStyles.menuItemTextItem}>All Items</span>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={3}>
        <FormControl sx={{ minWidth: '100%' }}>
          <Select
            value={popularItems}
            onChange={(event) => setPopularItems(event.target.value as string)}
            className={CustomSelectStyles.customSelect}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            IconComponent={() => (
              <KeyboardArrowDownIcon
                className={CustomSelectStyles.iconDown}
                sx={{ top: '10px !important' }}
              />
            )}
            MenuProps={{ classes: { paper: 'globalDropdown' } }}
          >
            <MenuItem value=''>
            <span className={`${CustomSelectStyles.menuItemTextItem} ${CustomSelectStyles.opaicty}`}>
                        Sort by:
                      </span>
                      <span className={CustomSelectStyles.menuItemTextItem}>
                        {" "}
                        Popular
                      </span>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </>
  )
}

import * as React from 'react'
import {
  Grid,
  InputBase,
  Typography,
  MenuItem,
  FormControl,
} from '@mui/material'
import Select from '@mui/material/Select'
import SearchIcon from '@mui/icons-material/Search'
import Classes from '../../style/Common/PageTopFilters.module.scss'
import CustomSelectClasses from '../../style/Common/CustomSelect.module.scss'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const PageTopFilters = () => {
  const [popularItems, setPopularItems] = React.useState('')
  const [allItems, setAllItems] = React.useState('')

  return (
    <Grid container spacing={2}>
      <Grid item md={6}>
        <Typography component='div' className={Classes.searchWrapper}>
          <SearchIcon className={Classes.searchIcon} />
          <InputBase placeholder='Search' className={Classes.searchInput} />
        </Typography>
      </Grid>
      <Grid item md={3}>
        <FormControl sx={{ minWidth: '100%' }}>
          <Select
            value={allItems}
            onChange={(event) => setAllItems(event.target.value as string)}
            className={CustomSelectClasses.customSelect}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            IconComponent={() => (
              <KeyboardArrowDownIcon className={CustomSelectClasses.iconDown} />
            )}
            MenuProps={{ classes: { paper: 'globalDropdown' } }}
          >
            <MenuItem value=''>
              <span>All Items</span>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item md={3}>
        <FormControl sx={{ minWidth: '100%' }}>
          <Select
            value={popularItems}
            onChange={(event) => setPopularItems(event.target.value as string)}
            className={CustomSelectClasses.customSelect}
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            IconComponent={() => (
              <KeyboardArrowDownIcon className={CustomSelectClasses.iconDown} />
            )}
            MenuProps={{ classes: { paper: 'globalDropdown' } }}
          >
            <MenuItem value=''>
              <span>Sort by: Popular</span>
            </MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default PageTopFilters

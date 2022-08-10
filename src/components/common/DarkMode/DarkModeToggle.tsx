import React, { useState, useEffect } from 'react'
import Classes from './DarkModeToggle.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import {
  Typography,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material'
import { setAppTheme } from 'store/reducers/authReducer'
import { useDispatch } from 'react-redux'

const getStorageTheme = () => {
  let theme = 'dark-theme'
  if (localStorage.getItem('theme')) {
    theme = localStorage.getItem('theme') || ''
  }
  return theme
}

const DarkModeToggle = (props: any) => {
  const dispatch = useDispatch();
  const { headerToggle = false, sidebarToggle = false } = props
  const [theme, setTheme] = useState(getStorageTheme())
  const toggleTheme = () => {
    if (theme === 'light-theme') {
      setTheme('dark-theme')
    } else {
      setTheme('light-theme')
    }
  }

  useEffect(() => {
    document.documentElement.className = theme
    localStorage.setItem('theme', theme)
    dispatch(setAppTheme(theme));
  }, [theme])
  return (
    <>
      {headerToggle && (
        <IconButton
          className={Classes.iconButton}
          size='large'
          onClick={toggleTheme}
        >
           {theme == 'light-theme' ? 
            <FontAwesomeIcon icon={faMoon} className={Classes.btnIcon} /> 
            :
            <FontAwesomeIcon icon={faSun} className={Classes.btnIcon} />
          }
        </IconButton>
      )}

      {sidebarToggle && (
        <Typography
          onClick={toggleTheme}
          component='div'
          className={Classes.tabLink}
        >
          <ListItemIcon className={Classes.listItemIcon}>
           {theme == 'light-theme' ? 
            <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} /> }
          </ListItemIcon>
          <ListItemText className={Classes.tabText} primary={`${theme == 'light-theme' ? 'Dark Mode' : 'Light Mode' }`} />
        </Typography>
      )}
    </>
  )
}

export default DarkModeToggle

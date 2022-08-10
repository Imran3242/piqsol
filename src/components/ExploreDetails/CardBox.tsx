import * as React from 'react'
import { Box } from '@mui/material'

import Classes from 'style/Explore/CardBox.module.scss'

const CardBox = (props:any) => {
  return (
    <Box className={`${Classes.cardBox} ${props.className}`}>{props.children}</Box>
  )
}

export default CardBox
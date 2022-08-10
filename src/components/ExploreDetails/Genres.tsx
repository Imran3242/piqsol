import React from 'react'
import CardBox from './CardBox'
import { Typography, Button } from '@mui/material'
import Classes from '../../style/Explore/Genres.module.scss'

const Genres = () => {
  const tags = ['hiphop','Remix','Electronic','Dance Pop','Electropop','Country Music','Heavy Metal', 'Punc Rock']
  return (
    <CardBox className={Classes.genresWrapper}>
      <Typography component='h4' className={Classes.title}>
        Genres
      </Typography>
      <Typography component='div' className={Classes.tagsWrapper}>
        {tags.map((tag,index) => (
          <Button key={index} className={Classes.tagBtn}>{tag}</Button>
        ))}
      </Typography>
    </CardBox>
  )
}

export default Genres

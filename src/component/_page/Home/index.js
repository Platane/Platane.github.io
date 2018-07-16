import React from 'react'
import styled from 'react-emotion'

import image_url from '../../../asset/image/arthur_brongniart.jpg'

import {LinkBar} from '../../LinkBar'

export const Home = () => (
  <Container>
    <Picture src={image_url} />

    <Separator />

    <Name>Arthur Brongniart</Name>

    <Separator />

    <Occupation>Gifted web developper</Occupation>

    <Separator />

    <LineSeparator />

    <LinkBar />
  </Container>
)

const Container = styled.div`
  margin: 90px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Picture = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: contain;
  object-position: center;
`

const Separator = styled.div`
  width: 40px;
  height: 40px;
`

const LineSeparator = styled.div`
  width: calc(100% - 20px);
  max-width: 360px;
  height: 1px;
  margin: 18px;
  background-color: #ddd;
`

const Name = styled.h1`
  margin: 0;
`
const Occupation = styled.h2`
  margin: 0;
  color: #666;
`

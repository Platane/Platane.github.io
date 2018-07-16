import React from 'react'
import styled from 'react-emotion'

import social from '../../content/social.json'

export const LinkBar = () => (
  <Container>
    {Object.keys(social).map(label => (
      <A href={social[label]} target="_blank">
        {label}
      </A>
    ))}
  </Container>
)

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  @media (max-width: 500px) {
    flex-direction: column;
  }
`

const A = styled.a`
  margin-left: 20px;

  &:first-child {
    margin-left: 0px;
  }

  @media (max-width: 500px) {
    margin-left: 0px;

    margin-top: 20px;

    &:first-child {
      margin-top: 0px;
    }
  }
`

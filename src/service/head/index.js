import React from 'react'
import preactRender from 'preact-render-to-string'

/**
  type Meta = {
    title: string,
    url:string,
    description: string,
    image: string,
    locale: string
  }
 */

export const toTag = meta => [
  <title>{meta.title}</title>,

  <link rel="canonical" href={meta.url} />,

  <meta property="og:locale" content={meta.locale} />,
  <meta property="og:type" content="article" />,
  <meta property="og:url" content={meta.url} />,
  <meta property="og:title" content={meta.title} />,
  <meta property="og:description" content={meta.description} />,
  <meta property="og:image" content={meta.image} />,

  <meta name="twitter:card" content="summary" />,
  <meta name="twitter:url" content={meta.url} />,
  <meta name="twitter:title" content={meta.title} />,
  <meta name="twitter:description" content={meta.description} />,
  <meta name="twitter:image" content={meta.image} />,
]

export const stringify = meta =>
  toTag(meta)
    .map(preactRender)
    .join('')

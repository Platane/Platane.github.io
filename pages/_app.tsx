import React from "react";
import App from "next/app";
import Head from "next/head";
import { description, author, homepage as url } from "../package.json";
import { normalized } from "../component/NormalizeCss";

export default class Application extends App {
  render() {
    const { Component } = this.props;

    const title = "platane homepage";
    const image = url + "/assets/img/avatar-460x460.jpg";

    return (
      <>
        <Head>
          <title>{title}</title>
          <meta property="og:type" content="website" />
          <meta property="og:url" content={url} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:email" content={author.email} />
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content="460" />
          <meta property="og:image:height" content="460" />
          <meta name="description" content={description} />
          <meta name="author" content={author.name} />
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:title" content={title} />
          <meta name="twitter:description" content={description} />
          <meta name="twitter:creator" content={author.twitter} />
          <meta name="twitter:image" content={image} />

          <link rel="icon" type="image/jpg" sizes="460x460" href={image} />

          <style dangerouslySetInnerHTML={{ __html: normalized.styles }} />
        </Head>

        <Component {...this.props.pageProps} />
      </>
    );
  }
}

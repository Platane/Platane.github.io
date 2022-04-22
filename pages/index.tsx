import React from "react";
import styled from "@emotion/styled";
import { LinkBar } from "../component/LinkBar";
import { Separator } from "../component/Separator";

const Page = () => (
  <Container>
    <Picture src="/assets/img/avatar-460x460.jpg" />

    <Separator />

    <Name>Arthur Brongniart</Name>

    <Separator />

    <Occupation>Gifted web developer</Occupation>

    <Separator />

    <LineSeparator />

    <LinkBar />
  </Container>
);

export default Page;

const Container = styled.div`
  margin: 90px auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Picture = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: contain;
  object-position: center;
`;

const LineSeparator = styled.div`
  width: calc(100% - 20px);
  max-width: 360px;
  height: 1px;
  margin: 18px;
  background-color: #ddd;
`;

const Name = styled.h1`
  margin: 0;
`;
const Occupation = styled.h2`
  margin: 0;
  color: #666;
`;

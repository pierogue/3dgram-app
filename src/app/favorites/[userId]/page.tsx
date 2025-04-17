'use client'

import { ModelCard } from "@/components/ModelCard/ModelCard";
import { Page } from "@/components/Page";
import { likeDto } from "@/dto/likeDto";
import { useServer } from "@/hooks/useServer";
import { Headline } from "@telegram-apps/telegram-ui";
import { useEffect, useState } from "react";
import styled from "styled-components";

type Props = {
  params: {
    userId: string
  }
}

const ModelsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    200px
  );
  gap: 18px;
  justify-items: center;
  justify-content: center;
  align-items: flex-start;
  max-width: 100%;
`

export default function FavoritesPage({params: {userId}}:Props){
  const [likes, setLikes] = useState<likeDto[] | null>(null);
  const {getUserLikes} = useServer()

  useEffect(()=>{
    getUserLikes(userId).then((res)=>{
      setLikes(res.data)
    })
  })

  return (
    <Page back={true}>
      <Headline style={{margin:12, textAlign: 'center'}}>Избранное</Headline>
      <ModelsWrapper>
        {likes?.map((like)=>{
          return (
            <ModelCard model={like.model}/>
          )
        })}
      </ModelsWrapper>
    </Page>
  )
}
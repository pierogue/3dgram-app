'use client'

import { ModelCard } from "@/components/ModelCard/ModelCard"
import { Page } from "@/components/Page"
import { modelDto } from "@/dto/modelDto"
import { userDto } from "@/dto/userDto"
import { useServer } from "@/hooks/useServer"
import { RootState } from "@/store/store"
import { Banner, Button, Headline } from "@telegram-apps/telegram-ui"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"

type Props = {
  params: {
    userId: string
  }
}

const PageWrapper = styled.div`
  width: 100%;
`

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

export default function UserPage({ params: { userId } }: Props) {
  const [models, setModels] = useState<modelDto[] | null>([]);
  const [user, setUser] = useState<userDto | null>(null);
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const { 
    getUser,
    getUserModels
  } = useServer()

  useEffect(()=>{

    const init = async ()=>{
      setModels((await getUserModels(userId)).data)
      setUser((await getUser(userId)).data)
    }
    init()
  }, [userId])

  return (<Page back={true}>
    <PageWrapper>
    {
        currentUser?.userId === user?.userId 
        ?
        <Banner 
          header="Добро пожаловать"
          background={<img style={{width: '100%'}} src="https://img.freepik.com/free-vector/3d-abstract-wave-pattern-background_53876-116945.jpg"/>}
        >
          <Link href={'/upload'}>
            <Button size="s" mode="white">
              Загрузить
            </Button>
          </Link>
          <Link href={`/favorites/${currentUser?.userId}`}>
            <Button size="s" mode="white">
              Избранное
            </Button>
          </Link>
        </Banner>
        :
        <></>
      }
      <Headline style={{margin: 24, textAlign: "center"}}>Модели пользователя {user?.name}</Headline>
      <ModelsWrapper>
        {models?.map((model)=>{
          return <ModelCard model={model}/>
        })}
      </ModelsWrapper>
    </PageWrapper>
  </Page>)
}
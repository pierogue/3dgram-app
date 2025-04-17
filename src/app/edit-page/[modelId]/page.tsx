'use client'

import { retrieveLaunchParams } from "@telegram-apps/sdk-react"
import { Button, Input, Spinner, Textarea } from "@telegram-apps/telegram-ui"
import { useEffect, useState } from "react"
import styled from "styled-components"
import ThreeScene from "@/components/ThreeScene/ThreeScene"
import { modelDto } from "@/dto/modelDto"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { mainButton } from '@telegram-apps/sdk-react';
import { useServer } from "@/hooks/useServer"
import { Page } from "@/components/Page"

const Scene = styled.div`
  width: 100%;
  height: 50vh;
`

const PageWrapper = styled.div`
  width: 100%;
`

type Props = {
  params: {
    modelId: number
  }
}

export default function EditPage({params: {modelId}}: Props) {

  const [model, setModel] = useState<modelDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );

  const {
    getModel,
    deleteModel,
    patchModel
  } = useServer()

  const lp = retrieveLaunchParams()
  
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTitle(e.target.value);
  }

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setDescription(e.target.value);
  }

  const handleDelete = () => {
    // axios.delete(`${apiUrl}/models/${modelId}`)
    if( currentUser?.userId === model?.owner.userId ) {
      deleteModel(modelId)
    } 
  }

  useEffect(() => {
    if (model) {
      setTitle(model.title);
      setDescription(model.description);
    }
  }, [model]);

  useEffect(()=>{
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
      mainButton.setParams({
        hasShineEffect: true,
        isEnabled: true,
        isLoaderVisible: false,
        isVisible: true,
        text: 'Сохранить',
      });
      mainButton.onClick(async ()=>{
        if(title && description){
          await patchModel({modelId, title,description})
        }
      })
    }

    return (()=>{
      mainButton.setParams({
        isVisible: false,
      });
      mainButton.unmount();
    })
  },[model, lp, title, description])

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await getModel(modelId);
        setModel(response.data);
      } catch (error) {
        setError('Error fetching model');
      } finally {
        setLoading(false);
      }
    };
    
    const initialize = async () => {
      await fetchModel();
    };

    initialize();
  }, [])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <Page back={true}>
      <PageWrapper>
        <Scene>
          <ThreeScene model={model}/>
        </Scene>
        <Input after={
          <Button onClick={handleDelete}
          style={{backgroundColor: "var(--tg-theme-destructive-text-color)"}}>
            Удалить
          </Button>
        } onChange={handleTitle} header='Название' value={''+title}/>
        <Textarea onChange={handleDescription} header={'Описание'} value={''+description}></Textarea>
      </PageWrapper>
    </Page>
  )
}

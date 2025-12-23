'use client'

import { retrieveLaunchParams } from "@telegram-apps/sdk-react"
import { Button, Input, Spinner, Textarea } from "@telegram-apps/telegram-ui"
import { useEffect, useState, useRef } from "react"
import styled from "styled-components"
import ThreeScene from "@/components/ThreeScene/ThreeScene"
import { modelDto } from "@/dto/modelDto"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { mainButton } from '@telegram-apps/sdk-react';
import { useServer } from "@/hooks/useServer"
import { usePrivileges } from "@/hooks/usePrivileges"
import { Page } from "@/components/Page"
import { useRouter } from "next/navigation"

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
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const router = useRouter();
  const { canDeleteModel } = usePrivileges();

  const {
    getModel,
    deleteModel,
    patchModel
  } = useServer();

  const lp = retrieveLaunchParams();

  const titleRef = useRef<string | null>(title);
  const descriptionRef = useRef<string | null>(description);

  useEffect(() => {
    titleRef.current = title;
    descriptionRef.current = description;
  }, [title, description]);

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const handleDelete = async () => {
    if (canDeleteModel(model)) {
      deleteModel(modelId);
      router.back();
    } 
  };

  useEffect(() => {
    if (model) {
      setTitle(model.title);
      setDescription(model.description);
    }
  }, [model]);

  useEffect(() => {
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
      mainButton.setParams({
        hasShineEffect: true,
        isEnabled: true,
        isLoaderVisible: false,
        isVisible: true,
        text: 'Сохранить',
      });
    }

    const handleMainButtonClick = async () => {
      if (titleRef.current && descriptionRef.current) {
        try {
          const updatedModel = await patchModel({ modelId, title: titleRef.current, description: descriptionRef.current });
          setModel(updatedModel.data);
          router.push('/');
        } catch (error) {
          setError('Error updating model');
        }
      }
    };

    mainButton.onClick(handleMainButtonClick);

    return () => {
      mainButton.setParams({
        isVisible: false,
      });
      mainButton.unmount();
    };
  }, []);

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
  }, []);

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
        } maxLength={50} onChange={handleTitle} header='Название' defaultValue={title || ''} />
        <Textarea maxLength={100} onChange={handleDescription} defaultValue={description || ''} header={'Описание'}></Textarea>
      </PageWrapper>
    </Page>
  )
}

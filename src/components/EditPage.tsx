import { backButton, useLaunchParams } from "@telegram-apps/sdk-react"
import { Avatar, AvatarStack, Button, Cell, Chip, Headline, Input, Spinner, Subheadline, Textarea } from "@telegram-apps/telegram-ui"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import ThreeScene from "./ThreeScene"
import { modelDto } from "../dto/modelDto"
import axios from "axios"
import { likeDto } from "../dto/likeDto"
import { useSelector } from "react-redux"
import { RootState } from "../store/store"
import { mainButton } from '@telegram-apps/sdk-react';

const Scene = styled.div`
  width: 100%;
  height: 50vh;
`

const PageWrapper = styled.div`
  width: 100%;
`

export const EditPage = () => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const [model, setModel] = useState<modelDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
  const lp = useLaunchParams();
  
  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTitle(e.target.value);
  }

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setDescription(e.target.value);
  }

  const handleDelete = () => {
    axios.delete(`${apiUrl}/models/${modelId}`)
      .then(()=>navigate(-1))
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
          await axios.patch(`${apiUrl}/models/${modelId}`,{
            title: title,
            description: description
          })
          navigate(`/user/${currentUser?.userId}`);
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
        const response = await axios.get(`${apiUrl}/models/${modelId}`);
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
  )
}

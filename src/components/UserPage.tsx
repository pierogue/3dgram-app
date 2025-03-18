import { backButton } from "@telegram-apps/sdk-react";
import { Banner, Button, ButtonCell, Headline, Spinner } from "@telegram-apps/telegram-ui"
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components"
import { userDto } from "../dto/userDto";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { modelDto } from "../dto/modelDto";
import axios from "axios";
import { ModelCard } from "./ModelCard";

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

export const UserPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useParams<{ userId: string }>();
  const [models, setModels] = useState<modelDto[] | null>([]);
  const [user, setUser] = useState<userDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;

  useEffect(()=>{
    
    const fetchUser = async ()=>{
      try {
        const response = await axios.get(`${apiUrl}/users/${userId}`);
        setUser(response.data);
      } catch (error) {
        setError('Error fetching models');
      } finally {
        setLoading(false);
      }
    }

    const fetchModels = async ()=>{
      try {
        const response = await axios.get(`${apiUrl}/models/user/${userId}`);
        setModels(response.data);
      } catch (error) {
        setError('Error fetching models');
      } finally {
        setLoading(false);
      }
    }

    const inititalize = async () => {
      await fetchUser();
      await fetchModels();
   
    }

    inititalize();

    // backButton.show();
    // const offClick = backButton.onClick(() => navigate(-1));
    
    // return ()=>{
    //   offClick();
    //   backButton.hide();
    // }
  }, [userId])

  const handleDownloadClick = () => {
    navigate('/upload');
  };
  
  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <PageWrapper>
      {
        currentUser?.userId === user?.userId 
        ?
        <Banner 
          header="Добро пожаловать"
          background={<img style={{width: '100%'}} src="https://img.freepik.com/free-vector/3d-abstract-wave-pattern-background_53876-116945.jpg"/>}
        >
          <Button size="s" mode="white" onClick={handleDownloadClick}>
            Загрузить
          </Button>
          <Button size="s" mode="white" onClick={()=>navigate(`/favorites/${userId}`)}>
            Избранное
          </Button>
          <Button size="s" mode="white" onClick={()=>navigate(`/statistics/${userId}`)}>
            Статистика
          </Button>
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
  )
}
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { likeDto } from "../dto/likeDto";
import axios from "axios";
import { Avatar, Cell, Headline, Spinner } from "@telegram-apps/telegram-ui";
import { ModelCard } from "./ModelCard";
import styled from "styled-components";

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

export const FavoritesPage = ()=>{
  const { userId } = useParams<{ userId: string }>();
  const [likes, setLikes] = useState<likeDto[] | null>(null);
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/likes/user/${userId}`);
        setLikes(response.data);
      } catch (error) {
        setError('Error fetching model');
      } finally {
        setLoading(false);
      }
    };
    
    const initialize = async () => {
      await fetchLikes();
    };

    initialize();
  }, [])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return(
    <>
      <Headline style={{margin:12, textAlign: 'center'}}>Избранное</Headline>
      <ModelsWrapper>
        {likes?.map((like)=>{
          return (
            <ModelCard model={like.model}/>
          )
        })}
      </ModelsWrapper>
    </>
  )
}
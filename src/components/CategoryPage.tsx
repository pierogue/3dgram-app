import { Headline, Spinner } from "@telegram-apps/telegram-ui"
import styled from "styled-components"
import { ModelCard } from "./ModelCard"
import { backButton } from "@telegram-apps/sdk-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { categoryDto } from "../dto/categoryDto";
import { modelDto } from "../dto/modelDto";

const CategoryWrapper = styled.div`
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

export const CategoryPage = () => {

  const [category, setCategory] = useState<categoryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  
  useEffect(()=>{
    
    const fetchCategory = async () => {
      try {
        const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
        const response = await axios.get(`${apiUrl}/categories/${categoryId}`);
        setCategory(response.data);
      } catch (error) {
        setError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();

    // backButton.show();
    // backButton.onClick(()=>{
    //   navigate('/')
    // })

    // return ()=>{
    //   backButton.hide();
    // }
  },[])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Headline style={{margin: 24, textAlign: 'center'}}>
        {category?.categoryName}
      </Headline>
      <CategoryWrapper>
        {category?.models.map((model)=>{
          return <ModelCard model={model} key={model.modelID}/>
        })}
      </CategoryWrapper>
    </>
  )
}
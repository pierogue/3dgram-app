'use client'

import { ModelCard } from "@/components/ModelCard/ModelCard";
import { Page } from "@/components/Page";
import { categoryDto } from "@/dto/categoryDto";
import { useServer } from "@/hooks/useServer";
import { Headline, Spinner } from "@telegram-apps/telegram-ui";
import axios from "axios";
import { useEffect, useState } from "react";
import styled from "styled-components";

type Props = {
  params: {
    categoryId: number
  }
}
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

export default function CategoryPage({params: {categoryId}}: Props) {

  const [category, setCategory] = useState<categoryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { getCategory } = useServer() 

  useEffect(()=>{
    
    const fetchCategory = async () => {
      try {
        const response = await getCategory(categoryId);
        setCategory(response.data);
      } catch (error) {
        setError('Error fetching categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  },[])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <Page back={true}>
      <Headline style={{margin: 24, textAlign: 'center'}}>
        {category?.categoryName}
      </Headline>
      <CategoryWrapper>
        {category?.models.map((model)=>{
          return <ModelCard model={model} key={model.modelID}/>
        })}
      </CategoryWrapper>
    </Page>
  )
}
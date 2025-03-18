import { InlineButtons, Spinner, Subheadline} from "@telegram-apps/telegram-ui";
import styled from "styled-components";
import { Filter } from "./Filter";
import { ModelCard } from "./ModelCard";
import arrow from '../assets/arrowDown.svg'
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoryLightDto } from "../dto/categoryDto";
import axios from "axios";
import { CategoryPreview } from "./CategoryPreview";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";


export const Catalog = () => {

  const [categories, setCategories] = useState<categoryLightDto[]>([])
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const selectedCategories = useSelector((state: RootState) =>
    state.filter.selectedCategories
  );
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );

  useEffect(()=>{
    const fetchCategories = async () => {
      try {
        const apiUrl: string | undefined = import.meta.env.VITE_APP_API_URL;
        const response = await axios.get(`${apiUrl}/categories/`);
        setCategories(response.data);
      } catch (error) {
        setError(''+import.meta.env.VITE_APP_API_URL);
      } finally {
        setLoading(false);
      }
    };

    if(currentUser?.blocked === true) 
      setError('Вы заблокированы!')

    fetchCategories();
  }, [])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Filter/>
      {selectedCategories.map((category)=>{
        return <CategoryPreview category={category} key={category.categoryID}/>
      })}
    </>
  )
}
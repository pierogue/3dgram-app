'use client'
import { Accordion, Button, Cell, Checkbox, Divider, Input } from "@telegram-apps/telegram-ui"
import { AccordionContent } from "@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent"
import { AccordionSummary } from "@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary"
import { useEffect, useState } from "react";
import styled from "styled-components";
import { categoryDto, categoryLightDto } from "../../dto/categoryDto";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, removeCategory, setCategories, setSearch } from "../../store/filterSlice";
import { RootState } from "../../store/store";
import axios from "axios";
import { initData, popup, retrieveLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { useServer } from "@/hooks/useServer";
import { usePrivileges } from "@/hooks/usePrivileges";

const SummaryLabel = styled.div`
  svg {
    width: 16px;
    margin: 12px;
  }

  display: flex;
  align-items: center;
`

// const lp = retrieveLaunchParams()

const DeleteButton = styled(Button)`
  color: var(--tg-theme-destructive-text-color);
`

export const Filter = () => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategoriesState] = useState<categoryLightDto[]>([]);
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const apiUrl:string|undefined= process.env.NEXT_PUBLIC_API_URL;
  const { canManageCategories } = usePrivileges();

  const {
    getCategories,
    getCategoryCount,
    postCategory, 
    deleteCategory, 
    fetchCurrentUser
  } = useServer()

  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const ctg = categories.find((ctg)=>ctg.categoryID == +e.target.value)
    if(e.target.checked){
      dispatch(addCategory(ctg!));
    }
    else {
      dispatch(removeCategory(ctg!))
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>)=>{
    dispatch(setSearch(e.target.value));
  }
  
  const handleNewCategory = (e: React.ChangeEvent<HTMLInputElement>)=>{
    if(e.target.value.trim()){
      setNewCategory(e.target.value.trim())
    }
    else {
      setNewCategory(null);
    }
  }
  
  const handleAddCategory = async ()=>{
    if(newCategory){
      await postCategory(newCategory);
      await fetchCategories();
      setNewCategory(null);
    }
  }
  
  const handleDeleteCategory = async (id: number)=>{
    const response = await getCategoryCount(id);
    if(response.data === 0) {
      await deleteCategory(id);
      await fetchCategories();
    }
    else {
      popup.open({
        title: 'Ошибка',
        message: 'Данная категория не пуста',
        buttons: [{ id: 'my-id', type: 'default', text: 'ОК' }],
      });
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      setCategoriesState(response.data);
      dispatch(setCategories(response.data));
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(()=>{
    fetchCurrentUser()
    fetchCategories()
  },[])
  
  return (
    <Accordion onChange={()=>setExpanded(!expanded)} expanded={expanded}>  
      <AccordionSummary>
        <SummaryLabel>
          <div className="icon">
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 1H1L9 10.46V17L13 19V10.46L21 1Z" stroke="var(--tg-theme-accent-text-color)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span color={retrieveLaunchParams().themeParams.link_color}>Фильтр</span>
        </SummaryLabel>
      </AccordionSummary>
      <AccordionContent>
        <form onSubmit={(e)=>e.preventDefault()}>
        <Input placeholder="Поиск моделей" onChange={handleSearch}/>
        {canManageCategories() && (
          <>
            <Divider />
            <Input after={<Button size="s" onClick={handleAddCategory}>+</Button>} placeholder="Добавить категорию" 
            onChange={handleNewCategory} value={newCategory ?? ''}/>
          </>
        )}
        </form>
        {categories.map((category)=>{
          return <>
            <Cell
              Component={canManageCategories() ? 'div' : 'label'}
              before={
                canManageCategories() ?
                <DeleteButton mode="plain" onClick={()=>handleDeleteCategory(category.categoryID)}>Удалить</DeleteButton>
                : <></>
            }
              after={<Checkbox name="filter" value={category.categoryID} defaultChecked={true} onChange={handleFilter}/>}>
                {category.categoryName}
            </Cell>
            <Divider/>
          </>
        })}
      </AccordionContent>
    </Accordion>
  )
}
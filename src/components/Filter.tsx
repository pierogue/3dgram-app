import { Accordion, Button, Cell, Checkbox, Divider, Input } from "@telegram-apps/telegram-ui"
import { AccordionContent } from "@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionContent/AccordionContent"
import { AccordionSummary } from "@telegram-apps/telegram-ui/dist/components/Blocks/Accordion/components/AccordionSummary/AccordionSummary"
import { useEffect, useState } from "react";
import styled from "styled-components";
import { categoryDto, categoryLightDto } from "../dto/categoryDto";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, removeCategory, setCategories, setSearch } from "../store/filterSlice";
import { RootState } from "../store/store";
import axios from "axios";
import { popup } from "@telegram-apps/sdk-react";

const SummaryLabel = styled.div`
  svg {
    width: 16px;
    margin: 12px;
  }

  display: flex;
  align-items: center;
`
const AccordionSummaryStyled = styled(AccordionSummary)`
  background-color: var(--tg-theme-bg-color);

  &:hover {
    background-color: var(--tg-theme-bg-color);
  }
` 

const CellStyled = styled(Cell)`
  background-color: var(--tg-theme-bg-color);

  &:hover {
    background-color: var(--tg-theme-bg-color);
  }
`

export const Filter = () => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategoriesState] = useState<categoryLightDto[]>([]);
  const [newCategoty, setNewCategory] = useState<string | null>(null);
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );

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
    if(newCategoty){
      await axios.post(`${apiUrl}/categories`,{
        name: newCategoty
      })
      await fetchCategories();
      setNewCategory(null);
    }
  }
  
  const handleDeleteCategory = async (id: number)=>{
    const response = await axios.get(`${apiUrl}/categories/${id}/count`)
    if(response.data === 0) {
      await axios.delete(`${apiUrl}/categories/${id}`)
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
      const response = await axios.get(`${apiUrl}/categories/`);
      setCategoriesState(response.data);
      dispatch(setCategories(response.data));
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(()=>{
    fetchCategories()
    //dispatch(setCategories(categories));
  },[])
  
  return (
    <Accordion onChange={()=>setExpanded(!expanded)} expanded={expanded}>
      <AccordionSummaryStyled>
        <SummaryLabel>
          <div className="icon">
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 1H1L9 10.46V17L13 19V10.46L21 1Z" stroke="var(--tg-theme-accent-text-color)'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>Фильтр</span>
        </SummaryLabel>
      </AccordionSummaryStyled>
      <AccordionContent>
        <Input placeholder="Поиск моделей" onChange={handleSearch}/>
        {currentUser?.role.roleName === 'MODERATOR' && (
          <>
            <Divider />
            <Input after={<Button size="s" onClick={handleAddCategory}>+</Button>} placeholder="Добавить категорию" 
            onChange={handleNewCategory} value={newCategoty ?? ''}/>
          </>
        )}
        {categories.map((category)=>{
          return <>
            <CellStyled
              Component={"label"}
              before={
                currentUser?.role.roleName === 'MODERATOR' ?
                <Button onClick={()=>handleDeleteCategory(category.categoryID)} size="s" style={{backgroundColor:"var(--tg-theme-destructive-text-color)"}}>-</Button>
                : <></>
            }
              after={<Checkbox name="filter" value={category.categoryID} defaultChecked={true} onChange={handleFilter}/>}>
                {category.categoryName}
            </CellStyled>
            <Divider/>
          </>
        })}
      </AccordionContent>
    </Accordion>
  )
}
'use client'

import { Button, FileInput, Input, Select, Spinner, Textarea, Image, Text } from "@telegram-apps/telegram-ui"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { categoryLightDto } from "@/dto/categoryDto"
import axios from "axios";
import struc from "images/archive_structure.png";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { popup } from "@telegram-apps/sdk-react";
import { modelDto } from "@/dto/modelDto";
import { useServer } from "@/hooks/useServer"

const PageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-flow: column;

`

export default function UploadPage() {

  const [categories, setCategories] = useState<categoryLightDto[]>([])
  const [title, setTitle] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const navigate = useNavigate();
  const currentUser = useSelector((state: RootState )=>
    state.user.currentUser
  );
  // const apiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;

  const { 
    getCategories,
    postModel
  } = useServer()

  useEffect(()=>{
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        setError('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setFile(e.target.files ? e.target.files[0] : null);
  }

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setTitle(e.target.value);
  }

  const handleDescription = (e: React.ChangeEvent<HTMLInputElement>)=>{
    setDescription(e.target.value);
  }

  const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>)=>{
    setCategoryId(+e.target.value);
  }

  
  const handleUpload = async ()=>{
    if(currentUser?.blocked === true) 
      return setError('Вы заблокированы!')
    setLoading(true);
    if (popup.open.isAvailable() && 
      (!file?.name.endsWith('.zip')
        || title === null
        || title.trim().length === 0
      )) 
    {
      setLoading(false);
      return popup.open({
        title: 'Ошибка',
        message: 'Некорректные данные.',
        buttons: [{ id: 'my-id', type: 'default', text: 'ОК' }],
      });
    }
    const response = await postModel({
      title: title!,
      description: description ?? ' ',
      ownerId: currentUser?.userId!,
      categoryId: categoryId!,
      file: file!
    })
    setLoading(false);
    const resModel : modelDto = response.data;
    // navigate(`/edit/${resModel.modelID}`)
  }

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <PageWrapper>
      <div style={{display: 'flex', flexFlow: 'row', padding: 20, gap: 20}}>
        <Image
          style={{width: 200, height: 200, minWidth: 200}}
          src={"/images/archive_structure.png"}
        />
        <Text>
        Загрузите архив с моделью в формате zip и убедитесь, что он соответствует структуре.
        </Text>
      </div>
      <FileInput required={true} label={file?.name ?? "Загрузите файл"} onChange={handleFile}/>
      <Input required={true} header="Название" onChange={handleTitle}/>
      <Select header="Категория" onChange={handleCategory}>
        {categories.map((ctg)=>{
          return <option value={ctg.categoryID}>{ctg.categoryName}</option>
        })}
      </Select>
      <Textarea required={false} header="Описание" onChange={handleDescription}/>
      <Button
        mode="filled"
        size="l"
        style={{margin: 18}}
        onClick={handleUpload}
      >
        Загрузить
      </Button>
    </PageWrapper>
  )
}
import { RootState } from "@/store/store";
import { setCurrentUser } from "@/store/userSlice";
import { initData, useSignal } from "@telegram-apps/sdk-react";
import axios from "axios"
import { useDispatch, useSelector } from "react-redux";

export const useServer = ()=> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const currentUser = useSelector((state: RootState)=> state.user.currentUser)
  const initUser = useSignal(initData.user);
  const dispatch = useDispatch()
  
  const fetchCurrentUser = async ()=>{
    try {
      const response = await getUser(''+initUser?.id);
      dispatch(setCurrentUser(response.data));
    } catch (error) {
      if(axios.isAxiosError(error)){
        if (error.response) {
          if (error.response.status === 404) {
            axios.post(`${apiUrl}/users`,
              {
                userId: initUser?.id,
                name: `${initUser?.firstName} ${initUser?.lastName ?? ''}`,
                blocked: false,
                avatarUrl: initUser?.photoUrl
              }
            ).then((res)=>{
              dispatch(setCurrentUser(res.data));
            })
          }
        }
      } 
      else {
        throw(new Error('Unable to create new user'))
      }
    }
  };
  
  const getUser = async (id: string) => {
    return await axios.get(`${apiUrl}/users/${id}`)
  }

  const getModel = async (modelId: number) => {
    return await axios.get(`${apiUrl}/models/${modelId}`);
  }

  const postModel = async (model: {
    title: string,
    description: string,
    ownerId: string,
    categoryId: number,
    file: File
  }) => {
    return await axios.postForm(`${apiUrl}/models`,{
      title: model.title,
      description: model.description ?? ' ',
      ownerId: currentUser?.userId,
      categoryId: model.categoryId,
      file: model.file
    })
  }

  const deleteModel = async (modelId: number) => {
    return await axios.delete(`${apiUrl}/models/${modelId}`)
  }

  const patchModel = async (model: {
    modelId: number,
    title: string,
    description: string
  }) => {
    return await axios.patch(`${apiUrl}/models/${model.modelId}`, {
      title: model.title,
      description: model.description
    })
  }

  const postModelCover = async (modelId: number, file: Buffer) => {
    return await axios.postForm(`${apiUrl}/models/${modelId}/cover`,{file:file})
  }

  const getDownloads = async (modelId: number) => {
    return await axios.get(`${apiUrl}/downloads/model/${modelId}`)
  }

  const postDownload = async (modelId: number, userId: string) => {
    return await axios.post(`${apiUrl}/downloads`, {modelId, userId})  
  }

  const getUserModels = async (userId: string) => {
    console.log(userId)
    return await axios.get(`${apiUrl}/models/user/${userId}`);
  }

  const blockUser = async (id: string, block: boolean) => {
    return await axios.patch(`${apiUrl}/users/block/${id}`,{block})
  }

  const getCategories = async () => {
    return await axios.get(`${apiUrl}/categories/`);
  }

  const getCategory = async (id: number) => {
    return await axios.get(`${apiUrl}/categories/${id}`)
  }

  const getCategoryCount = async (id: number) => {
    return await axios.get(`${apiUrl}/categories/${id}/count`)
  }

  const postCategory = async (name: string)=>{
    return await axios.post(`${apiUrl}/categories`, {name})
  }

  const deleteCategory = async (id: number) => {
    return await axios.delete(`${apiUrl}/categories/${id}`)
  }

  const getModelLikes = async (modelId: number) => {
    return await axios.get(`${apiUrl}/likes/model/${modelId}`);
  }

  const getUserLikes = async (userId: string) => {
    return await axios.get(`${apiUrl}/likes/user/${userId}`);
  }

  const postLike = async (modelId: number, userId: string) => {
    return await axios.post(`${apiUrl}/likes`, {modelId, userId})
  }

  const deleteLike = async (likeId: number) => {
    return await axios.delete(`${apiUrl}/likes/${likeId}`)
  }


  return {
    apiUrl,
    getUser,
    blockUser,
    getUserLikes,
    postLike,
    deleteLike,
    getModel,
    getUserModels,
    postModel,
    deleteModel,
    patchModel,
    postModelCover,
    postDownload,
    getModelLikes,
    getCategories,
    getCategory,
    getCategoryCount,
    fetchCurrentUser,
    postCategory,
    deleteCategory,
    getDownloads
  }
}
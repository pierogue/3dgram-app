import '@telegram-apps/telegram-ui/dist/styles.css';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import { Catalog } from './components/Catalog';
import { Header } from './components/Header';
import { GlobalStyles } from './styles/globalStyles';
import { CategoryPage } from './components/CategoryPage';
import { ModelPage } from './components/ModelPage';
import { UserPage } from './components/UserPage';
import { useEffect, useState } from 'react';
import { useLaunchParams } from '@telegram-apps/sdk-react';
import axios from 'axios';
import { Spinner } from '@telegram-apps/telegram-ui';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from './store/userSlice';
import { BasicLayout } from './components/BasicLayout';
import { UploadPage } from './components/UploadPage';
import { EditPage } from './components/EditPage';
import { LikesPage } from './components/LikesPage';
import { FavoritesPage } from './components/FavoritesPage';
import StatisticsPage from './components/StatisticsPage';

export default function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const lp = useLaunchParams();

  useEffect(()=>{

    const initUser = lp.initData?.user;
    const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;

    const fetchUser = async () => {
      try {
        if(!initUser){
          throw Error("Authorization error. Maybe you're not using Telegram client.")
        }
        const response = await axios.get(`${apiUrl}/users/${initUser?.id}`)
        dispatch(setCurrentUser(response.data));
      } catch (error) {
        if(axios.isAxiosError(error)){
          if (error.response) {
            if (error.response.status === 404) {
              const response = await axios.post(`${apiUrl}/users`,
                {
                  userId: initUser?.id,
                  name: `${initUser?.firstName} ${initUser?.lastName ?? ''}`,
                  blocked: false,
                  avatarUrl: initUser?.photoUrl
                }
              )

              dispatch(setCurrentUser(response.data));
            }
          }
        } 
        else {
          setError("Authorization error. Maybe you're not using Telegram client.");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchUser();
  
  },[])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return (
    <>
    <GlobalStyles/>
    <BrowserRouter>
      <Header/>
      <Routes>
        <Route path={'/'} index element={<Catalog/>}/>
        <Route element={<BasicLayout/>}>
          <Route path={'/category/:categoryId'} element={<CategoryPage/>}/>
          <Route path={'/model/:modelId'} element={<ModelPage/>}/>
          <Route path={'/user/:userId'} element={<UserPage/>}/>
          <Route path={'/upload'} element={<UploadPage/>}/>
          <Route path={'/edit/:modelId'} element={<EditPage/>}/>
          <Route path={'/likes/:modelId'} element={<LikesPage/>}/>
          <Route path={'/favorites/:userId'} element={<FavoritesPage/>}/>
          <Route path={'/statistics/:userId'} element={<StatisticsPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}



import { backButton, openLink, useLaunchParams } from "@telegram-apps/sdk-react"
import { Avatar, AvatarStack, Button, Cell, Chip, Headline, Spinner, Subheadline } from "@telegram-apps/telegram-ui"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import styled from "styled-components"
import ThreeScene from "./ThreeScene"
import { modelDto } from "../dto/modelDto"
import axios from "axios"
import { likeDto } from "../dto/likeDto"
import { useSelector } from "react-redux"
import { RootState } from "../store/store"
import { mainButton } from '@telegram-apps/sdk-react';

const Scene = styled.div`
  width: 100%;
  height: 80vh;
`

const PageWrapper = styled.div`
  width: 100%;
`

export const ModelPage = () => {
  const navigate = useNavigate();
  const { modelId } = useParams<{ modelId: string }>();
  const [likes, setLikes] = useState<likeDto[] | null>([]);
  const [model, setModel] = useState<modelDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [currentLike, setCurrentLike] = useState<likeDto | null>(null);
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
  const lp = useLaunchParams();
  
  const handleDownload = async () => {
    if (openLink.isAvailable()) {
      openLink(`${apiUrl}/static/archives/${modelId}/${model?.modelUrl}`, {
        tryBrowser: 'chrome',
        tryInstantView: true,
      });
      await axios.post(`${apiUrl}/downloads`,{
        userId: currentUser?.userId,
        modelId: modelId
      })
    }
  }    

  const handleBlock = ()=>{
    axios.patch(`${apiUrl}/users/block/${model?.owner.userId}`,{
      block: !model?.owner.blocked
    }).then(()=>{
      navigate(-1);
    })
  }
  
  useEffect(()=>{
    mainButton.onClick(handleDownload)

    return(()=>{
      mainButton.offClick(handleDownload);
    })
  },[handleDownload])

  useEffect(()=>{
    if (mainButton.mount.isAvailable()) {
      mainButton.mount();
      mainButton.setParams({
        hasShineEffect: true,
        isEnabled: true,
        isLoaderVisible: false,
        isVisible: true,
        text: 'Скачать',
      });

    }

    return (()=>{
      mainButton.setParams({
        isVisible: false,
      });
      mainButton.unmount();
    })
  },[model, lp])

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const response = await axios.get(`${apiUrl}/models/${modelId}`);
        setModel(response.data);
      } catch (error) {
        setError('Error fetching model');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchLikes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/likes/model/${modelId}`);
        setLikes(response.data);
        console.log(likes);
      } catch (error) {
        setError('Error fetching likes');
      } finally {
        setLoading(false);
      }
    };

    const initialize = async () => {
      await fetchModel();
      await fetchLikes();
    };
    initialize();

    // backButton.show();
    // const offClick = backButton.onClick(() => navigate(-1));
    
    // return ()=>{
    //   offClick();
    //   backButton.hide();
    // }
  }, [currentLike?.likeID])


  useEffect(()=>{
    const foundLike = likes?.find((like) => like.user.userId === currentUser?.userId);
    if (foundLike) {
      setCurrentLike(foundLike);
      setIsLiked(true);
    }
  }, [likes, currentUser])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  const toggleLike = async ()=>{
    if(!isLiked){
      axios.post(`${apiUrl}/likes`,
        {
          userId: currentUser?.userId,
          modelId: model?.modelID
        }
      )
      .then((res)=>{
        let like: likeDto = res.data;
        setCurrentLike(like);
        setIsLiked(true);
      })
      .catch((err)=>{
        throw new Error(err);
      });
    }
    else {
      axios.delete(`${apiUrl}/likes/${currentLike?.likeID}`)
        .then(()=>{
          setIsLiked(false);
          setCurrentLike(null);
        })
        .catch((err)=>{
          throw new Error(err);
        })
    }
  }

  return (
    <PageWrapper>
      <Scene>
        <ThreeScene model={model}/>
      </Scene>
      <Headline style={{margin: "16px 16px 8px 16px" }}>{model?.title}</Headline>
      <Link to={`/user/${model?.owner.userId}`}>
        <Cell before={
            <Avatar src={model?.owner.avatarUrl} size={28}/>
          }
          after={
            currentUser?.role.roleName === "MODERATOR"
            && model?.owner.userId !== currentUser.userId ?
            model?.owner.blocked ?
            <Button onClick={handleBlock} size="s" style={{backgroundColor:"var(--tg-theme-accent-text-color)"}}>Разблокировать</Button>
            :
            <Button onClick={handleBlock}
             size="s" style={{backgroundColor:"var(--tg-theme-destructive-text-color)"}}>Заблокировать</Button> :
            <></>
          }>
          <span style={{fontSize: 14, color: "var(--tg-theme-text-color)"}}>
            {model?.owner.name}
          </span>
        </Cell>
      </Link>
      <Subheadline style={{margin: "8px 16px 16px 16px"}}>{model?.description}</Subheadline>
      <Cell before={
        <Button onClick={toggleLike} size="s" style={{backgroundColor: 'var(--tg-theme-accent-text-color)'}}>
          <>
          <svg display='block' width={16} height={16} viewBox="-0.64 -0.64 17.28 17.28" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" fill={isLiked ? '#ffffff' : 'none'}></path> </g></svg>
          </>
        </Button>
      } 
      after={
        <AvatarStack onClick={()=>navigate(`/likes/${modelId}`)}>
          <Avatar src={likes ? likes.at(2)?.user.avatarUrl ?? '' : ''} size={24}/>
          <Avatar src={likes ? likes.at(1)?.user.avatarUrl ?? '' : ''} size={24}/>
          <Avatar src={likes ? likes.at(0)?.user.avatarUrl ?? '' : ''} size={24}/>
        </AvatarStack>
      }>
        <span style={{fontSize: 13}}>
          Понравилось {likes?.length} {(likes?.length ?? 0) % 10 === 1 && (likes?.length ?? 0) % 100 !== 11? ' пользователю' : ' пользователям'}
        </span>
      </Cell>
    </PageWrapper>
  )
}

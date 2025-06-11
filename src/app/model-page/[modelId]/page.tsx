'use client'

import { Page } from "@/components/Page"
import ThreeScene from "@/components/ThreeScene/ThreeScene"
import { downloadDto } from "@/dto/downloadDto"
import { likeDto } from "@/dto/likeDto"
import { modelDetailsDto, modelDto } from "@/dto/modelDto"
import { useServer } from "@/hooks/useServer"
import { RootState } from "@/store/store"
import { initData, mainButton, openLink, retrieveLaunchParams, useSignal } from "@telegram-apps/sdk-react"
import { Avatar, AvatarStack, Button, Cell, Headline, IconButton, Spinner, Subheadline, Text } from "@telegram-apps/telegram-ui"
import axios from "axios"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import styled from "styled-components"
import { useRouter } from "next/navigation"

type Props = {
  params: {
    modelId: number
  }
}

const Scene = styled.div`
  width: 100%;
  height: 80vh;
  position: relative;
`

const PageWrapper = styled.div`
  width: 100%;
`

export default function ModelPage ({params: { modelId }}:Props) {

  const [likes, setLikes] = useState<likeDto[] | null>([]);
  const [downloads, setDownloads] = useState<downloadDto[] | null>([]);
  const [model, setModel] = useState<modelDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [currentLike, setCurrentLike] = useState<likeDto | null>(null);
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const apiUrl:string|undefined= process.env.NEXT_PUBLIC_API_URL;
  const lp = retrieveLaunchParams()
  const initDataState = useSignal(initData.state);
  const router = useRouter();
  const { 
    getModel,
    postDownload,
    getModelLikes,
    postLike,
    deleteLike,
    blockUser,
    getDownloads
  } = useServer()

  const handleDownload = async () => {
    if (openLink.isAvailable()) {
      openLink(`${apiUrl}/static/archives/${modelId}/${model?.modelUrl}`, {
        tryBrowser: 'chrome',
        tryInstantView: true,
      });
      
      await postDownload(modelId, currentUser?.userId!!)
    }
  }    

  const handleBlock = async ()=>{
    await blockUser(model?.owner.userId!!, !model?.owner.blocked)
    router.back()
  }

  
  const toggleLike = async ()=>{
    if(!isLiked){
      postLike(modelId, currentUser?.userId!!)
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
      deleteLike(currentLike?.likeID!!)
        .then(()=>{
          setIsLiked(false);
          setCurrentLike(null);
        })
        .catch((err)=>{
          throw new Error(err);
        })
    }
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
        const response = await getModel(modelId);
        setModel(response.data);
      } catch (error) {
        setError('Error fetching model');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchLikes = async () => {
      try {
        const response = await getModelLikes(modelId);
        setLikes(response.data);
        console.log(likes)
      } catch (error) {
        setError('Error fetching likes');
      } finally {
        setLoading(false);
      }
    };

    const fetchDownloads = async ()=>{
      try{
        const response = await getDownloads(modelId);
        setDownloads(response.data);
      } catch (error) {
        setError('Error fetching downloads');
      } finally {
        setLoading(false);
      }
    }

    const initialize = async () => {
      await fetchModel();
      await fetchLikes();
      await fetchDownloads();
    };
    initialize();
  }, [currentLike?.likeID])


  useEffect(()=>{
    const foundLike = likes?.find((like) => like.user.userId === currentUser?.userId);
    if (foundLike) {
      setCurrentLike(foundLike);
      setIsLiked(true);
    }
  }, [likes, currentUser])

  if (loading) return <Spinner size="m"/>;

  return (
    <Page back={true}>
      <PageWrapper>
        <Scene>
          <ThreeScene model={model}/>
        </Scene>
        <Headline style={{margin: "16px 16px 8px 16px", width: '90%', overflow: "hidden", wordBreak: 'break-word'}}>{model?.title}</Headline>
        <Link href={`/user-page/${model?.owner.userId}`}>
          <Cell before={
              <Avatar src={model?.owner.avatarUrl} size={28}/>
            }
            after={
              currentUser?.role.roleName === "MODERATOR"
              && model?.owner.userId !== currentUser.userId ?
              model?.owner.blocked ?
              <Button onClick={handleBlock} size="s" style={{backgroundColor:lp.themeParams.accent_text_color}}>Разблокировать</Button>
              :
              <Button onClick={handleBlock}
              size="s" style={{backgroundColor:lp.themeParams.destructive_text_color}}>Заблокировать</Button> :
              <></>
            }>
            <span style={{fontSize: 14, color: 'var(--tg-theme-link-color)'}}>
              {model?.owner.name}
            </span>
          </Cell>
        </Link>
        <Subheadline style={{margin: "8px 16px 16px 16px", color: lp.themeParams.text_color, width: '90%', wordBreak: 'break-word'}}>{model?.description}</Subheadline>
        <Text style={{fontSize: "12px" , margin: "8px 16px 16px 16px", color: 'var(--tg-theme-subtitle-text-color)'}}>{new Date(model?.createdAt!).toDateString()}</Text>
        <Cell before={
          <Button onClick={toggleLike} size="s" style={{backgroundColor: lp.themeParams.accent_text_color}}>
            <>
            <svg display='block' width={16} height={16} viewBox="-0.64 -0.64 17.28 17.28" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M1.24264 8.24264L8 15L14.7574 8.24264C15.553 7.44699 16 6.36786 16 5.24264V5.05234C16 2.8143 14.1857 1 11.9477 1C10.7166 1 9.55233 1.55959 8.78331 2.52086L8 3.5L7.21669 2.52086C6.44767 1.55959 5.28338 1 4.05234 1C1.8143 1 0 2.8143 0 5.05234V5.24264C0 6.36786 0.44699 7.44699 1.24264 8.24264Z" fill={isLiked ? '#ffffff' : 'none'}></path> </g></svg>
            </>
          </Button>
        } 
        after={
          <Link href={`/likes-page/${modelId}`}>
          <AvatarStack>
            <Avatar src={likes ? likes.at(2)?.user.avatarUrl ?? '' : ''} size={24}/>
            <Avatar src={likes ? likes.at(1)?.user.avatarUrl ?? '' : ''} size={24}/>
            <Avatar src={likes ? likes.at(0)?.user.avatarUrl ?? '' : ''} size={24}/>
          </AvatarStack>
          </Link>
        }>
          <span style={{fontSize: 13, color: lp.themeParams.text_color}}>
            Понравилось {likes?.length} {(likes?.length ?? 0) % 10 === 1 && (likes?.length ?? 0) % 100 !== 11? ' пользователю' : ' пользователям'}
          </span>
        </Cell>
        <Cell>
            <span style={{fontSize: 13, color: lp.themeParams.text_color}}>
            Скачали {downloads?.length} {(downloads?.length ?? 0) % 10 === 1 && (downloads?.length ?? 0) % 100 !== 11 ? ' раз' : (downloads?.length ?? 0) % 10 >= 2 && (downloads?.length ?? 0) % 10 <= 4 && ((downloads?.length ?? 0) % 100 < 10 || (downloads?.length ?? 0) % 100 >= 20) ? ' раза' : ' раз'}
            </span>
        </Cell>
      </PageWrapper>
    </Page>
  )
}
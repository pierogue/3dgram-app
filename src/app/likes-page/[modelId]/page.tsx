'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { likeDto } from "@/dto/likeDto";
import axios from "axios";
import { Avatar, Cell, Spinner } from "@telegram-apps/telegram-ui";
import { Page } from "@/components/Page";

type Props = {
  params: {
    modelId: number
  }
}

export default function LikesPage({params: {modelId}}: Props){
  const [likes, setLikes] = useState<likeDto[] | null>(null);
  const apiUrl:string|undefined= process.env.NEXT_PUBLIC_API_URL;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/likes/model/${modelId}`);
        setLikes(response.data);
      } catch (error) {
        setError('Error fetching model');
      } finally {
        setLoading(false);
      }
    };
    
    const initialize = async () => {
      await fetchLikes();
    };

    initialize();
  }, [])

  if (loading) return <Spinner size="m"/>;
  if (error) return <div>{error}</div>;

  return(
    <Page back={true}>
      {likes?.map((like)=>{
        return (
          <Link href={`/user-page/${like.user.userId}`}>
            <Cell subtitle={(new Date(like.timestamp)).toLocaleString()} key={like.likeID} before={<Avatar src={like.user.avatarUrl}/>}>
                {like.user.name}
            </Cell>
          </Link>
        )
      })}
    </Page>
  )
}
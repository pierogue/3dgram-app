'use client'

import { Avatar, Banner } from "@telegram-apps/telegram-ui"
import { Link } from "@/components/Link/Link"
import { initData, useSignal } from "@telegram-apps/sdk-react";

export const Header = () => {
  const initDataState = useSignal(initData.state);
  const currentUser = initDataState?.user;
  return(
    <Link href={`/user-page/${currentUser?.id}`}>
      <Banner
        before={<Avatar size={28} style={{marginLeft: "10px"}} fallbackIcon={<span>🥵</span>} src={currentUser?.photoUrl}/>}
        header={currentUser?.firstName}
        type="section"
      />
    </Link>
  )
}
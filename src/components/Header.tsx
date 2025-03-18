import { Avatar, Banner } from "@telegram-apps/telegram-ui"
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../store/store";

export const Header = () => {

  const currentUser = useSelector((state: RootState)=>
    state.user.currentUser
  );

  return (
    <Link to={`/user/${currentUser?.userId}`} style={{color: "var(--tg-theme-text-color)"}}>
    <Banner
      style={{backgroundColor: "var(--tg-theme--bg-color)"}}
      before={<Avatar size={28} style={{marginLeft: "10px"}} fallbackIcon={<span>🥵</span>} src={currentUser?.avatarUrl}/>}
      header={currentUser?.name}
      type="section"
    />
    </Link>
  )
}
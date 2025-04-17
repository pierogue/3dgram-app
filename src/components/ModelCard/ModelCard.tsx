import { themeParams, retrieveLaunchParams, useSignal } from "@telegram-apps/sdk-react"
import { Badge, Button, Card } from "@telegram-apps/telegram-ui"
import { CardCell } from "@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardCell/CardCell"
import { useEffect } from "react"
import Link from "next/link"
import { modelDto } from "../../dto/modelDto"
import { CardChip } from "@telegram-apps/telegram-ui/dist/components/Blocks/Card/components/CardChip/CardChip"
import { useSelector } from "react-redux"
import { RootState } from "../../store/store"

export const ModelCard = ({model}: {model: modelDto}) => {

  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );

  if (model.owner?.blocked === true) return <></>

  return (
    <Link href={`/model-page/${model.modelID}`}>
      <Card type="plain" style={{minWidth: 200,
         color: "var(--tg-theme-text-color)",
         backgroundColor: "var(--tg-theme-bg-color)",
         }}>
          <Link href={`/edit-page/${model.modelID}`}>
            {
              location.pathname.includes('user') && location.pathname.split('/')[2] === currentUser?.userId
              || currentUser?.role.roleName === "MODERATOR" ?
              <CardChip mode="outline">
                <svg fill="var(--tg-theme-accent-color)" height="18px" width="18px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306.637 306.637"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M12.809,238.52L0,306.637l68.118-12.809l184.277-184.277l-55.309-55.309L12.809,238.52z M60.79,279.943l-41.992,7.896 l7.896-41.992L197.086,75.455l34.096,34.096L60.79,279.943z"></path> <path d="M251.329,0l-41.507,41.507l55.308,55.308l41.507-41.507L251.329,0z M231.035,41.507l20.294-20.294l34.095,34.095 L265.13,75.602L231.035,41.507z"></path> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> </g> </g></svg>
              </CardChip>:<></>
            }
          </Link>
        <img
          alt={model.title}
          src={`${process.env.NEXT_PUBLIC_API_URL}/static/${model.modelID}/cover.jpeg`}
          style={{
            display: 'block',
            height: 200,
            objectFit: 'cover',
            width: 200,
          }}
          />
        <CardCell
          readOnly
          subtitle={`${model.description} `}
          style={{backgroundColor: "var(--tg-theme-bg-color)"}}
          >
          {model.title}
        </CardCell>
      </Card>
    </Link>
  )
}
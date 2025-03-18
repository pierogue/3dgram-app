import { Outlet, useNavigate } from "react-router";
import { backButton } from "@telegram-apps/sdk-react";
import { useEffect } from "react";

export const BasicLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    backButton.show();
    const offClick = backButton.onClick(() => navigate(-1));
    return () => {
      offClick();
      backButton.hide();
    };
  }, []);

  return (
    <>
      <Outlet />
    </>
  );
};
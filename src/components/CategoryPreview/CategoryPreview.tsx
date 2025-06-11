// npm install swiper

import { Spinner, Subheadline } from "@telegram-apps/telegram-ui";
import Link from "next/link";
import styled from "styled-components";
import { categoryLightDto } from "../../dto/categoryDto";
import { useEffect, useState } from "react";
import axios from "axios";
import { modelDto } from "../../dto/modelDto";
import { ModelCard } from "@/components/ModelCard/ModelCard";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // ONLY core CSS for dragging

const CategoryPreviewWrapper = styled.div`
  margin: 16px;
  width: calc(100% - 16px);
`;

export const CategoryPreview = ({ category }: { category: categoryLightDto }) => {
  const [models, setModels] = useState<modelDto[] | null>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchQuery = useSelector((state: RootState) => state.filter.searchInput);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const apiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/models/category/${category.categoryID}`);
        setModels(response.data);
      } catch (error) {
        setError("Error fetching models");
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (loading) return <Spinner size="m" />;
  if (error) return <div>{error}</div>;
  if (models?.length === 0) return <></>;

  const filteredModels = models?.filter(
    (model) =>
      model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.owner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredModels?.length === 0) return <></>;

  return (
    <CategoryPreviewWrapper>
      <Subheadline style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{category.categoryName}</span>
        <Link
          href={`/category-page/${category.categoryID}`}
          style={{ color: "var(--tgui--link_color)" }}
        >
          <span>
            Смотреть все
            <div className="iconFill" style={{ display: "inline", margin: "0 28px 0 14px" }}>
              <svg
                width="18"
                height="10"
                viewBox="0 0 14 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683418 14.0976 1.31658 13.7071 1.70711L7.70711 7.70711C7.31658 8.09763 6.68342 8.09763 6.29289 7.70711L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683418 0.292893 0.292893Z"
                  fill="#007AFF"
                />
              </svg>
            </div>
          </span>
        </Link>
      </Subheadline>

      <Swiper
        spaceBetween={10}
        slidesPerView={"auto"}
        grabCursor={true}
        style={{ padding: "16px 0 8px 0" }}
      >
        {filteredModels?.map((model) => (
          <SwiperSlide style={{ width: "auto" }} key={model.modelID}>
            <ModelCard model={model} />
          </SwiperSlide>
        ))}
      </Swiper>
    </CategoryPreviewWrapper>
  );
};

'use client';

import { useTranslations } from 'next-intl';
import { Page } from '@/components/Page';
import { Filter } from '@/components/Filter/Filter';
import { useSelector } from 'react-redux';
import { CategoryPreview } from '@/components/CategoryPreview/CategoryPreview';
import { useEffect, useMemo, useState } from 'react';
import { RootState } from '@/store/store';
import { categoryLightDto } from '@/dto/categoryDto';
import { SectionHeader } from '@telegram-apps/telegram-ui/dist/components/Blocks/Section/components/SectionHeader/SectionHeader';
import { useServer } from '@/hooks/useServer';

export default function Home() {
  const t = useTranslations('i18n');
  const selectedCategories = useSelector((state: RootState) =>
    state.filter.selectedCategories
  );
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const [error, setError] = useState<string | null>(null);
  const [, setCategories] = useState<categoryLightDto[]>([])

  const {getCategories} = useServer();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data);
      } catch (error) {
        setError(error as string);
      }
    };

    fetchCategories();
  }, []);
  
  useEffect(()=>{
    if(currentUser?.blocked === true) 
      setError(t('Вы заблокированы!'))
  },[currentUser])

  if (error) {
    return <Page back={false}>
      <SectionHeader>
        {error}
      </SectionHeader>
    </Page>
  }

  return (
    <Page back={false}>
      <Filter/>
      {selectedCategories.map((ctg)=><CategoryPreview key={ctg.categoryID} category={ctg}/>)}
    </Page>
  );
}

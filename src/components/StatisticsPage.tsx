import { Headline, Subheadline } from '@telegram-apps/telegram-ui';
import axios from 'axios';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { RootState } from '../store/store';
import { modelDetailsDto } from '../dto/modelDto';

const StatisticDiv = styled.div`
  display: flex;
  align-items: center;
  flex-flow: column;
`

type LikesStat = {
  date: string,
  amount: number
}

type DownloadsStat = {
  date: string,
  amount: number
}

const StatisticsPage: React.FC = () => {
  const likesRef = useRef(null);
  const downloadsRef = useRef(null);
  const apiUrl:string|undefined= import.meta.env.VITE_APP_API_URL;
  const [models, setModels] = useState<modelDetailsDto[]>([]);
  const currentUser = useSelector((state: RootState) => 
    state.user.currentUser
  );
  const fetchModels = async () => {
    const response = await axios.get(`${apiUrl}/models/user/${currentUser?.userId}`)
    setModels(response.data);
  }

  useEffect(()=>{
    fetchModels()
  },[])

  useEffect(() => {
    let likes: LikesStat[] = [];
    let downloads: DownloadsStat[] = [];
    models.forEach(m => {
      m.likes.forEach(like => {
      let str = new Date(like.timestamp).toLocaleDateString()
      const existingLike = likes.find(l => l.date === str);
      if (existingLike) {
        existingLike.amount++;
      } else {
        let str = new Date(like.timestamp).toLocaleDateString()
        likes.push({ date: str, amount: 1 });
      }
      });


      m.downloads.forEach(dwld => {
        let str = new Date(dwld.timestamp).toLocaleDateString()
        const existingDwld = downloads.find(l => l.date === str);
        if (existingDwld) {
          existingDwld.amount++;
        } else {
          let str = new Date(dwld.timestamp).toLocaleDateString()
          downloads.push({ date: str, amount: 1 });
        }
        });
      
    });

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = window.innerWidth * 0.8 - margin.left - margin.right;
    const height = window.innerHeight * 0.4 - margin.top - margin.bottom;

    const svgLikes = d3.select(likesRef.current)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const svgDownloads = d3.select(downloadsRef.current)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xLikes = d3.scaleBand()
      .domain(likes.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const xDownloads = d3.scaleBand()
    .domain(downloads.map(d => d.date))
    .range([0, width])
    .padding(0.1);

    const yLikes = d3.scaleLinear()
      .domain([0, d3.max(likes, d => d.amount) || 0])
      .nice()
      .range([height, 0]);

    const yDownloads = d3.scaleLinear()
      .domain([0, d3.max(downloads, d => d.amount) || 0])
      .nice()
      .range([height, 0]);

    svgLikes.append('g')
      .selectAll('.bar')
      .data(likes)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xLikes(d.date) || 0)
      .attr('y', d => yLikes(d.amount))
      .attr('width', xLikes.bandwidth())
      .attr('height', d => height - yLikes(d.amount))
      .attr('fill', 'steelblue');

    svgLikes.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xLikes));

    svgLikes.append('g')
      .call(d3.axisLeft(yLikes));

    svgDownloads.append('g')
      .selectAll('.bar')
      .data(downloads)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xDownloads(d.date) || 0)
      .attr('y', d => yDownloads(d.amount))
      .attr('width', xDownloads.bandwidth())
      .attr('height', d => height - yDownloads(d.amount))
      .attr('fill', 'orange');

    svgDownloads.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xDownloads));

    svgDownloads.append('g')
      .call(d3.axisLeft(yDownloads));
  }, [models]);

  return (
    <StatisticDiv>
      <Headline style={{ margin: 16, textAlign: 'center' }}>Статистика</Headline>
      <div>
        <Subheadline style={{textAlign:'center'}}>Лайки</Subheadline>
        <div ref={likesRef}></div>
      </div>
      <div>
        <Subheadline style={{textAlign:'center'}}>Скачивания</Subheadline>
        <div ref={downloadsRef}></div>
      </div>
    </StatisticDiv>
  );
};

export default StatisticsPage;

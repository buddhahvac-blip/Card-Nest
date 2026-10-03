'use client';
import {useEffect} from 'react';
import {trackBeta} from '@/lib/client-analytics';
export default function ShowcaseVisit(){useEffect(()=>{trackBeta('showcase-view')},[]);return null}

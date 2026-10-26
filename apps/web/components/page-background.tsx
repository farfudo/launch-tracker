"use client";

import Image from 'next/image';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import type {Locale} from '../lib/i18n';
import {getBackgroundSection,pageBackgrounds} from '../lib/page-backgrounds';

function BackgroundImage({section}:{section:keyof typeof pageBackgrounds}) {
  const [failed,setFailed]=useState(false);
  const image=pageBackgrounds[section];
  return <div className="site-background" data-section={section} aria-hidden="true">
    {!failed&&<Image src={image.src} fill unoptimized alt="" sizes="100vw" loading="lazy" fetchPriority="low" style={{objectPosition:image.position}} onError={()=>setFailed(true)}/>}
  </div>;
}
export function PageBackground() {
  const section=getBackgroundSection(usePathname());
  return <BackgroundImage key={section} section={section}/>;
}

export function BackgroundCredit({locale}:{locale:Locale}) {
  const image=pageBackgrounds[getBackgroundSection(usePathname())];
  const label={'pt-PT':'Fundo','en-GB':'Background','es-ES':'Fondo'}[locale];
  return <span className="background-credit"> · {label}: <a href={image.source} title={image.title} target="_blank" rel="noopener noreferrer">{image.credit} ↗</a></span>;
}

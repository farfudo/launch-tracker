type ArtProps = { index:number; active:boolean; labels:string[];stage:number;paused:boolean;parts:string[] };

function OrbitingStarship({x,receiving,active,mirror=false}:{x:number;receiving:boolean;active:boolean;mirror?:boolean}) {
  // Two separate illustrative tanks: oxygen and methane are never mixed here.
  const oxygen = receiving ? (active?182:204) : (active?198:172);
  const methane = receiving ? (active?253:275) : (active?269:243);
  return <g className="orbital-starship" style={{transform:`translateX(${x}px)`}}><g transform={mirror?'scale(-1 1)':undefined}>
    <path d="M-43 130Q-40 86 0 46Q40 86 43 130V304H-43Z" fill="url(#lab-metal)" stroke="#c3d9e4" strokeWidth="1.5"/>
    <path d="M0 46Q40 86 43 130V304H18V124Q17 79 0 46Z" fill="#172a3c" stroke="#547182"/>
    <path d="M-39 115-66 147-62 171-40 154M39 115l24 28-2 23-20-14" fill="url(#lab-metal)" stroke="#94b5c9"/>
    <path d="M-40 254-62 290v29l22-16M40 254l31 36v28l-30-15" fill="url(#lab-metal)" stroke="#94b5c9"/>
    <path d="M-62 163-2 146" stroke="#cce4ec" opacity=".35"/>
    {[132,152,174,197,219,241,263,285].map(y=><path key={y} d={`M-42 ${y}q30 10 60 4`} stroke="#d0e1e8" opacity=".25" fill="none"/>)}
    <rect x="-31" y="151" width="47" height="65" rx="12" fill="#0a2436" stroke="#86b7c7"/>
    <rect x="-31" y="229" width="47" height="61" rx="12" fill="#0a2436" stroke="#86b7c7"/>
    <g clipPath="url(#ship-oxygen)"><rect className="tank-liquid" x="-30" y={oxygen} width="45" height={216-oxygen} fill="url(#lab-liquid)"/><ellipse className="tank-liquid-surface" cx="-7.5" cy={oxygen} rx="22.5" ry="5" fill="#b3f8eb"/></g>
    <g clipPath="url(#ship-methane)"><rect className="tank-liquid" x="-30" y={methane} width="45" height={290-methane} fill="url(#lab-copper)"/><ellipse className="tank-liquid-surface" cx="-7.5" cy={methane} rx="22.5" ry="5" fill="#ffe0b5"/></g>
    <g transform={mirror?'translate(-14 0) scale(-1 1)':undefined}><text className="ship-propellant" x="-7" y="174" textAnchor="middle">O₂</text><text className="ship-propellant" x="-7" y="251" textAnchor="middle">CH₄</text></g>
    <path d="M-27 113q15-31 29-41M-37 136v151" stroke="#eaf6fc" opacity=".4" fill="none"/>
    <ellipse cx="0" cy="305" rx="44" ry="10" fill="#183448" stroke="#7a9bae"/>
    {[-24,0,24].map(px=><path key={px} d={`M${px-5} 305h10l4 15q-9 6-18 0Z`} fill="url(#lab-metal)" stroke="#6e90a2"/>)}
    {[160,192,224,256].map(y=><g key={y} className="docking-port"><ellipse cx="-43" cy={y} rx="5" ry="8" fill="#193247" stroke="#d5e7f0"/>{!receiving&&<path d={`M-43 ${y}h-15`} stroke="#d2eaf2" strokeWidth="3"/>}</g>)}
  </g></g>;
}

/** Illustrated cutaways: intentionally conceptual, not engineering models. */
export function TechnologyArt({index,active,labels,stage,paused,parts}:ArtProps) {
  const joined=stage>=2;
  const transfer=stage>=3;
  const left=joined?250:stage===1?210:stage===0?160:110;
  const right=joined?390:stage===1?430:stage===0?480:530;
  return <svg id="technology-illustration" data-stage={stage} viewBox="0 0 640 400" role="img" aria-label={labels.join(' · ')} className={`technology-art art-${index} ${active?'is-active':''} ${paused?'is-paused':''}`}>
    <defs>
      <linearGradient id="lab-metal"><stop stopColor="#253c52"/><stop offset=".22" stopColor="#7e9caf"/><stop offset=".4" stopColor="#d2e2eb"/><stop offset=".55" stopColor="#829fb1"/><stop offset=".8" stopColor="#375367"/><stop offset="1" stopColor="#152c40"/></linearGradient>
      <linearGradient id="lab-copper"><stop stopColor="#704b38"/><stop offset=".4" stopColor="#f5c899"/><stop offset=".6" stopColor="#c58c60"/><stop offset="1" stopColor="#674331"/></linearGradient>
      <linearGradient id="lab-glass"><stop stopColor="#7fe7e3" stopOpacity=".35"/><stop offset=".45" stopColor="#1a7481" stopOpacity=".16"/><stop offset="1" stopColor="#0b293f" stopOpacity=".8"/></linearGradient>
      <linearGradient id="lab-liquid"><stop stopColor="#298a98"/><stop offset=".4" stopColor="#8df4df"/><stop offset="1" stopColor="#296b89"/></linearGradient>
      <linearGradient id="engine-fire" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f9f5cf"/><stop offset=".35" stopColor="#95ddff"/><stop offset=".7" stopColor="#ffb460"/><stop offset="1" stopColor="#ff7543" stopOpacity="0"/></linearGradient>
      <radialGradient id="chamber-glow"><stop stopColor="#fff4ca"/><stop offset=".4" stopColor="#ffc67a" stopOpacity=".8"/><stop offset="1" stopColor="#ff8747" stopOpacity="0"/></radialGradient>
      <linearGradient id="lab-carbon" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#5b788b"/><stop offset=".4" stopColor="#293f53"/><stop offset="1" stopColor="#0c2236"/></linearGradient>
      <pattern id="composite-weave" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-10)"><path d="M0 0 14 14M-7 7 7 21M7-7 21 7" stroke="#8da6ba" strokeWidth="4" opacity=".28"/><path d="M0 14 14 0" stroke="#cfdee6" opacity=".16"/></pattern>
      <clipPath id="ship-oxygen"><rect x="-30" y="152" width="45" height="63" rx="11"/></clipPath>
      <clipPath id="ship-methane"><rect x="-30" y="230" width="45" height="59" rx="11"/></clipPath>
      <filter id="lab-shadow" x="-30%" y="-30%" width="160%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <g aria-hidden="true">
      {index!==2 && <><ellipse cx="320" cy="336" rx="220" ry="28" fill="#020f1d" opacity=".6" filter="url(#lab-shadow)"/>
      <g stroke="#769eb5" opacity=".1" fill="none"><path d="M50 350 300 275 590 350M120 377 330 305 550 377M80 320l180 65M180 290l240 95M300 276l270 85"/><ellipse cx="320" cy="339" rx="245" ry="44"/></g></>}
      <g fill="#8cbbcc" opacity=".35"><circle cx="42" cy="54" r="1.5"/><circle cx="592" cy="91" r="1"/><circle cx="569" cy="302" r="1.5"/><circle cx="70" cy="290" r="1"/></g>
    </g>
    {index===0 ? <>
      {/* Raptor-inspired silhouette, not a published internal flow diagram. */}
      <text x="144" y="36" textAnchor="middle">{labels[0]}</text><text x="492" y="36" textAnchor="middle">{labels[1]}</text>
      <path d="M160 51v34q0 20 26 20h44M480 51v34q0 20-26 20h-44" stroke="url(#lab-metal)" strokeWidth="16" fill="none"/>
      <path className="tech-flow" d="M160 51v34q0 20 26 20h44" stroke="#ffbe78" strokeWidth="3" fill="none"/>
      <path className="tech-flow" d="M480 51v34q0 20-26 20h-44" stroke="#a3dfff" strokeWidth="3" fill="none"/>
      <path d="M230 105h42q14 0 14 18v30M410 105h-42q-14 0-14 18v30" stroke="url(#lab-metal)" strokeWidth="16" fill="none"/>
      {[230,410].map(x=><g key={x} transform={`translate(${x} 105)`}><ellipse rx="28" ry="31" fill="url(#lab-metal)" stroke="#aac8d8"/><ellipse rx="17" ry="22" fill="#183b4d"/><path className="engine-pump" d="M-11 0h22M0-15v30m-8-11 16 22m0-22L-8 11" stroke="#b7f8e8" strokeWidth="2"/></g>)}
      <path d="M255 101v-33h40v37M385 101V68h-40v37" stroke="url(#lab-copper)" strokeWidth="10" fill="none"/>
      {[273,349].map(x=><g key={x}><path d={`M${x} 67v25q9 9 18 0V67Z`} fill="url(#lab-metal)" stroke="#bdd0d9"/><ellipse cx={x+9} cy="67" rx="9" ry="4" fill="#a5bfcd"/></g>)}
      <g className="raptor-preburn" opacity={stage>=1?1:0}><ellipse cx="282" cy="80" rx="13" ry="19" fill="url(#chamber-glow)"/><ellipse cx="358" cy="80" rx="13" ry="19" fill="url(#chamber-glow)"/></g>
      <g className="raptor-gases" opacity={stage>=1?1:0} fill="none" strokeWidth="3"><path className="tech-flow" d="M282 92v28l-52 8v12h57v20" stroke="#ffbe78"/><path className="tech-flow" d="M358 92v28l52 8v12h-57v20" stroke="#a3dfff"/></g>
      <path d="M213 135v77l39 59M427 135v77l-39 59" stroke="#9cb6c5" strokeWidth="5" fill="none"/>
      <path d="M248 129h-49v42h43M392 129h49v42h-43" fill="none" stroke="#4b6e84" strokeWidth="5"/>
      {/* Chamber and a shaded bell. Right-hand opening shows the interior. */}
      <path d="M286 153q34-24 68 0v67c0 26 30 51 50 82q-84 43-168 0c20-31 50-56 50-82Z" fill="url(#lab-metal)" stroke="#b1c8d5" strokeWidth="1.5"/>
      <ellipse cx="320" cy="153" rx="34" ry="10" fill="#b5ccd7" stroke="#e2eff4"/>
      <ellipse cx="320" cy="302" rx="84" ry="23" fill="#10283d" stroke="#a4c1d3" strokeWidth="3"/>
      <ellipse cx="320" cy="302" rx="72" ry="16" fill="#061727" stroke="#55758c"/>
      <path d="M320 166h23v54c0 25 23 52 47 78q-34 13-70 13Z" fill="#0b2133" stroke="#7091a8"/>
      <path d="M321 180h20m-20 13h20m-20 13h20m-20 16h22m-22 17h31m-31 17h44m-44 17h56" stroke="#70b7bd" strokeWidth="2" opacity=".65"/>
      <path d="M288 166q14 6 28 6M284 224q15 7 28 6M277 243q18 9 34 9M266 263q25 12 46 10M253 283q29 14 59 13" stroke="#d2e6ef" fill="none" opacity=".45"/>
      <path d="M284 148v-18h72v18" stroke="url(#lab-copper)" strokeWidth="9" fill="none"/>
      <ellipse className="engine-combustion" cx="332" cy="202" rx="22" ry="37" fill="url(#chamber-glow)" opacity={active?1:0}/>
      <path className="engine-flame" d="M255 307Q270 358 320 391Q370 358 385 307Q320 330 255 307Z" fill="url(#engine-fire)" opacity={active?1:0}/>
      <g className="engine-exhaust" opacity={active?1:0} fill="none" stroke="#e6f9ff"><ellipse cx="320" cy="333" rx="36" ry="5"/><ellipse cx="320" cy="352" rx="24" ry="4"/><path d="M299 325v39M339 325v39" strokeDasharray="3 8"/></g>
      <path className="engine-thrust" opacity={active?1:0} d="M320 111V48m-9 13 9-13 9 13" stroke="#9df4dc" strokeWidth="4" fill="none"/>
      <g className="technical-callout"><path d="M365 237h69l17-16M384 350h50l17 15"/><circle cx="365" cy="237" r="3"/><circle cx="384" cy="350" r="3"/></g>
      <text x="460" y="221">{labels[2]}</text><text x="460" y="372">{labels[3]}</text>
      <g className="engine-part-labels"><path d="M200 105h-60M282 68l-12-8h-37M354 193l70-28h61M253 279h-90" stroke="#7fa9bc" fill="none"/><text x="130" y="110" textAnchor="end">{parts[0]}</text><text x="228" y="59" textAnchor="end">{parts[1]}</text><text x="493" y="167">{parts[2]}</text><text x="150" y="284" textAnchor="end">{parts[3]}</text></g>
    </> : index===1 ? <>
      {/* Three offset faces give the sample thickness and reveal its layers. */}
      <g className="composite-base">
        <path d="m118 172 230-53 183 126-231 61Z" fill="#1b334b" stroke="#809cae"/>
        <path d="M118 172v28l182 133v-27Z" fill="#244459" stroke="#67879d"/>
        <path d="m300 306 231-61v27l-231 61Z" fill="url(#lab-metal)" stroke="#7b9eb4"/>
        {[0,1,2].map(n=><path key={n} d={`m125 ${183+n*7} 175 127 225-59`} fill="none" stroke="#a7c4d3" opacity=".4"/>)}
      </g>
      <g className="composite-layer" style={{transform:active?'translateY(-14px)':'translateY(0)'}}>
        <path d="m118 145 230-53 183 126-231 61Z" fill="url(#lab-copper)" stroke="#d1af88"/>
        <path className="material-heater" d="m158 150 156-35 126 87-148 40-101-72 129-30 87 59-108 28-62-43 80-19 39 27" fill="none" stroke="#ffd18e" strokeWidth="5" opacity={active?.95:.3}/>
      </g>
      <g className="composite-layer" style={{transform:active?'translateY(-32px)':'translateY(0)'}}>
        <path d="m118 112 230-53 183 126-231 61Z" fill="url(#lab-carbon)" stroke="#a7c2d3"/>
        <path d="m118 112 230-53 183 126-231 61Z" fill="url(#composite-weave)"/>
        <path d="m118 112 182 134v10L118 122Z" fill="#5c778a" stroke="#9ab6c8"/>
        <path d="m300 246 231-61v10l-231 61Z" fill="#263e53" stroke="#7897aa"/>
        <path d="m156 125 165-38 145 101M212 164l164-40" fill="none" stroke="#78bfb9" strokeWidth="2"/>
        {[{x:190,y:117},{x:322,y:87},{x:405,y:145},{x:255,y:154}].map(({x,y},i)=><g key={x}>
          <ellipse className="material-sensor-halo" style={{animationDelay:`${i*.25}s`}} cx={x} cy={y} rx="13" ry="7" fill="none" stroke="#91f5d9"/>
          <ellipse cx={x} cy={y} rx="6" ry="3" fill="#b5ffea"/>
        </g>)}
        <path className="material-crack" d="m330 107-22 23 25 7-18 19 28 13-14 21" fill="none" stroke="#ffba75" strokeWidth="5" opacity={active?0:1}/>
        <ellipse className="material-heat" cx="326" cy="148" rx="90" ry="37" transform="rotate(18 326 148)" fill="url(#chamber-glow)" opacity={active?.65:0}/>
      </g>
      <path className="material-heat-rays" d="M275 267v-28m-5 7 5-7 5 7M360 238v-28m-5 7 5-7 5 7M433 215v-28m-5 7 5-7 5 7" stroke="#ffd5a5" strokeWidth="2" opacity={active?.8:0} fill="none"/>
      <g className="technical-callout"><path d="M190 94 151 52H79M187 254l-35 53H73M413 269l39 52h87"/><circle cx="190" cy="94" r="3"/><circle cx="187" cy="254" r="3"/><circle cx="413" cy="269" r="3"/></g>
      <text x="64" y="43">{labels[0]}</text><text x="54" y="334">{labels[1]}</text><text x="453" y="348">{active?labels[3]:labels[2]}</text>
    </> : <>
      <path d="M-80 425Q320 290 720 425" fill="#183d61" stroke="#699fcb" strokeWidth="4"/>
      <path d="M-60 438Q320 307 700 438" fill="#15324e" stroke="#b5d6e3" strokeWidth="2" opacity=".45"/>
      <OrbitingStarship x={left} receiving={false} active={transfer} mirror/><OrbitingStarship x={right} receiving active={transfer}/>
      <g opacity={stage===0?1:0} className="docking-navigation" fill="none" stroke="#91d6df"><path d="M235 110h50m-8-6 8 6-8 6M405 110h-50m8-6-8 6 8 6" strokeWidth="2"/><path d="M220 170 420 208 220 246M420 170 220 208 420 246" opacity=".3" strokeDasharray="3 6"/></g>
      <text className="ship-name" x={left} y="28" textAnchor="middle">{labels[0]}</text><text className="ship-name" x={right} y="28" textAnchor="middle">{labels[1]}</text>
      <text className="ship-name" x={left} y="350" textAnchor="middle">Starship</text><text className="ship-name" x={right} y="350" textAnchor="middle">Starship</text>
      <g className="docking-alignment" opacity={stage===1?1:0} stroke="#8bc8dc" fill="none" strokeDasharray="3 6"><path d="M270 160h100M270 256h100"/><circle cx="320" cy="208" r="31"/><path d="M278 208h84M320 167v82"/></g>
      <g className="docking-capture" opacity={joined?1:0} stroke={transfer?'#a3f4da':'#e1bb81'} fill="url(#lab-metal)">
        {[160,192,224,256].map(y=><g key={y}><path d={`M293 ${y}h54`} strokeWidth="4"/><circle cx="320" cy={y} r="5"/></g>)}
      </g>
      <g className="docking-transfer" opacity={transfer?1:0}>
        <path className="tech-flow" d="M293 192h54" stroke="#a6f2df" strokeWidth="3" fill="none"/>
        <path className="tech-flow" d="M293 224h54" stroke="#ffd2a1" strokeWidth="3" fill="none"/>
        <text className="ship-transfer-label" x="320" y="180" textAnchor="middle">O₂</text><text className="ship-transfer-label" x="320" y="247" textAnchor="middle">CH₄</text>
      </g>
      <text x="320" y="380" textAnchor="middle">{labels[2]}</text>
    </>}
  </svg>;
}

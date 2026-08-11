'use client';
import {useEffect,useMemo,useState} from 'react';

const FLOWS=['Exportações','Importações','Global'] as const;
const FREQS={mensal:'Mensal',trimestral:'Trimestral',semestral:'Semestral',anual:'Anual'} as const;
const YEARS=[2022,2023,2024,2025];
const SECTIONS=[
 ['I','Animais vivos e produtos do reino animal'],['II','Produtos do reino vegetal'],['III','Gorduras e óleos'],['IV','Produtos alimentares, bebidas e tabaco'],['V','Produtos minerais'],['VI','Indústrias químicas'],['VII','Plásticos e borracha'],['VIII','Peles, couros e artigos'],['IX','Madeira e cortiça'],['X','Pastas de madeira, papel e cartão'],['XI','Matérias têxteis e obras'],['XII','Calçado, chapéus e semelhantes'],['XIII','Pedra, cimento, cerâmica e vidro'],['XIV','Pérolas, pedras e metais preciosos'],['XV','Metais comuns e obras'],['XVI','Máquinas e aparelhos'],['XVII','Material de transporte'],['XVIII','Instrumentos ópticos e de precisão'],['XIX','Armas e munições'],['XX','Mercadorias e produtos diversos'],['XXI','Objectos de arte e antiguidades']
] as const;
const DOWNLOADS=[
 ['Resultados recalculados','Excel','Indices_Comercio_Externo_Recalculados_2022_2025_Previsao_2026.xlsx'],
 ['Fontes públicas agregadas','Excel','Fontes_Publicas_Agregadas_ICE_2022_2025.xlsx'],
 ['Relatório técnico final','PDF','Relatorio_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf'],
 ['Relatório técnico editável','Word','Relatorio_Final_ICE_Mocambique_2022_2025_Previsao_2026.docx'],
 ['Apresentação institucional','PDF','Apresentacao_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf'],
 ['Apresentação editável','PowerPoint','Apresentacao_Final_ICE_Mocambique_2022_2025_Previsao_2026.pptx'],
 ['Manual de Utilização','PDF','Manual_Utilizacao_Plataforma_ICE_DNCE.pdf'],
 ['Manual editável','Word','Manual_Utilizacao_Plataforma_ICE_DNCE.docx'],
 ['Manual Metodológico de Cálculo','PDF','Manual_Metodologico_Calculo_Indices_Comercio_Externo_DNCE.pdf'],
 ['Manual Metodológico editável','Word','Manual_Metodologico_Calculo_Indices_Comercio_Externo_DNCE.docx'],
 ['Plano de capacitação e articulação','PDF','Plano_Capacitacao_Articulacao_Plataforma_ICE_DNCE.pdf'],
 ['Plano de capacitação editável','Word','Plano_Capacitacao_Articulacao_Plataforma_ICE_DNCE.docx']
];
const SUPPORT_DOWNLOADS=DOWNLOADS.filter(([title])=>!['Relatório técnico final','Relatório técnico editável','Apresentação institucional','Apresentação editável'].includes(String(title)));
const fmt=(n:any)=>Number.isFinite(n)?Number(n).toLocaleString('pt-MZ',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';

function LineChart({rows,flow,label}:{rows:any[];flow:string;label:string}){
 const valid=rows.filter(r=>Number.isFinite(r?.[flow]?.index));
 if(!valid.length)return <div className="empty">Sem observações admissíveis para esta selecção.</div>;
 const values=valid.map(r=>r[flow].index), min=Math.min(...values),max=Math.max(...values);
 const lo=Math.min(75,min-6),hi=Math.max(115,max+6),span=Math.max(1,hi-lo);
 const W=900,H=310,L=54,R=28,T=34,B=55;
 const points=valid.map((r,i)=>({r,x:valid.length===1?W/2:L+i*(W-L-R)/(valid.length-1),y:T+(hi-r[flow].index)*(H-T-B)/span}));
 return <div className="chartArea" aria-label={label}>
  <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img">
   {[0,.25,.5,.75,1].map(k=>{const y=T+k*(H-T-B),v=hi-k*span;return <g key={k}><line x1={L} y1={y} x2={W-R} y2={y}/><text x={L-8} y={y+4} textAnchor="end" className="axisValue">{v.toFixed(0)}</text></g>})}
   <polyline points={points.map(p=>`${p.x},${p.y}`).join(' ')}/>
   {points.map((p,i)=><g key={p.r.period}><circle cx={p.x} cy={p.y} r="5"/><rect x={p.x-24} y={p.y-29} width="48" height="20" rx="4" className="dataBox"/><text x={p.x} y={p.y-15} textAnchor="middle" className="dataLabel">{fmt(p.r[flow].index)}</text><text x={p.x} y={H-22} textAnchor="middle" className="periodLabel">{p.r.period.replace(String(p.r.year),'').trim()||p.r.period}</text></g>)}
  </svg>
 </div>
}

export default function Home(){
 const [data,setData]=useState<any>();
 const [flow,setFlow]=useState<string>('Global'),[freq,setFreq]=useState<keyof typeof FREQS>('anual'),[year,setYear]=useState<string>('all');
 const [groupFlow,setGroupFlow]=useState<string>('Exportações'),[groupFreq,setGroupFreq]=useState<keyof typeof FREQS>('anual'),[groupYear,setGroupYear]=useState(2025),[section,setSection]=useState('V');
 useEffect(()=>{fetch('/data/results.json').then(r=>r.json()).then(setData)},[]);
 const rows=useMemo(()=>{const all=data?.results?.[freq]??[];return all.filter((r:any)=>year==='all'||r.year===Number(year))},[data,freq,year]);
 const groupRows=useMemo(()=>{const all=data?.section_results_by_frequency?.[groupFreq]??[];return all.filter((r:any)=>r.year===groupYear&&r.section===section)},[data,groupFreq,groupYear,section]);
 const groupSnapshot=useMemo(()=>{const all=data?.section_results_by_frequency?.[groupFreq]??[];const p=Math.max(...all.filter((r:any)=>r.year===groupYear).map((r:any)=>r.period_no),1);return all.filter((r:any)=>r.year===groupYear&&r.period_no===p)},[data,groupFreq,groupYear]);
 const forecast=data?.forecast_2026?.[flow];
 const changeFreq=(v:keyof typeof FREQS)=>{setFreq(v);setYear(v==='anual'?'all':'2025')};
 return <main>
  <header className="hero"><nav><div className="brand"><span className="seal">ME</span><span>REPÚBLICA DE MOÇAMBIQUE<br/><b>MINISTÉRIO DA ECONOMIA · DNCE</b></span></div><div className="navlinks"><a href="#centro">Centro de Dados</a><a href="#grupos">21 Grupos</a><a href="#downloads">Documentos</a></div></nav><div className="heroGrid"><div><p className="eyebrow">PLATAFORMA ESTATÍSTICA INSTITUCIONAL</p><h1>Índices do Comércio<br/>Externo de Moçambique</h1><p className="lead">Explore Exportações, Importações e o Índice Global por ano, periodicidade e Secção do Sistema Harmonizado.</p><div className="notice">Base 2022=100 · Observações: Jan 2022–Set 2025 · Cenário indicativo: 2026</div></div><div className="heroStats"><span>398</span><p>posições SH8 no cabaz</p><span>21</span><p>Secções de produtos</p><span>4</span><p>periodicidades disponíveis</p></div></div></header>

  <section className="wrap" id="centro"><div className="sectionHead"><div><p className="eyebrow dark">EXPLORADOR INTERACTIVO</p><h2>Centro de Dados</h2></div><p>Todos os gráficos apresentam o valor do índice junto de cada ponto. 2025 corresponde a Janeiro–Setembro.</p></div>
   <div className="controls"><div><label>Fluxo</label><div className="seg">{FLOWS.map(f=><button key={f} className={flow===f?'active':''} onClick={()=>setFlow(f)}>{f}</button>)}</div></div><div><label>Periodicidade</label><select value={freq} onChange={e=>changeFreq(e.target.value as keyof typeof FREQS)}>{Object.entries(FREQS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div><label>Ano</label><select value={year} onChange={e=>setYear(e.target.value)}>{freq==='anual'&&<option value="all">Todos os anos</option>}{YEARS.map(y=><option key={y} value={y}>{y}{y===2025?' (Jan–Set)':''}</option>)}</select></div></div>
   <div className="dashboard"><article className="chartCard"><div className="cardTitle"><div><span className="micro">SÉRIE SELECCIONADA</span><h3>{flow} · {FREQS[freq]}{year!=='all'?` · ${year}`:''}</h3></div><span className="unit">Índice</span></div><LineChart rows={rows} flow={flow} label={`${flow} ${FREQS[freq]}`}/></article><aside className="forecast"><p className="eyebrow">CENÁRIO 2026</p><strong>{forecast?fmt(forecast.point):'—'}</strong><p>Intervalo indicativo<br/><b>{forecast?fmt(forecast.lower_scenario):'—'}–{forecast?fmt(forecast.upper_scenario):'—'}</b></p><small>Tendência linear OLS 2022–2025. 2025 é parcial; não constitui previsão oficial.</small></aside></div>
   <div className="tableWrap"><table><thead><tr><th>Período</th><th>Exportações</th><th>Importações</th><th>Global</th></tr></thead><tbody>{rows.map((r:any)=><tr key={r.period}><td>{r.period}</td>{FLOWS.map(f=><td key={f} className={flow===f?'focus':''}>{fmt(r[f]?.index)}</td>)}</tr>)}</tbody></table></div>
  </section>

  <section className="bands"><div className="wrap"><p className="eyebrow dark">ÍNDICE GLOBAL ANUAL</p><h2>Leitura directa dos resultados</h2><LineChart rows={data?.results?.anual??[]} flow="Global" label="Índice Global Anual"/><p className="footnote">* 2025 corresponde a Janeiro–Setembro. Os rótulos mostram o valor exacto do índice.</p></div></section>

  <section className="wrap groups" id="grupos"><div className="sectionHead"><div><p className="eyebrow dark">SECÇÕES DO SISTEMA HARMONIZADO</p><h2>Explorador dos 21 grupos</h2></div><p>Consulta padronizada por fluxo, ano, grupo e periodicidade mensal, trimestral, semestral ou anual.</p></div>
   <div className="controls groupControls"><div><label>Fluxo</label><select value={groupFlow} onChange={e=>setGroupFlow(e.target.value)}>{FLOWS.map(f=><option key={f}>{f}</option>)}</select></div><div><label>Periodicidade</label><select value={groupFreq} onChange={e=>setGroupFreq(e.target.value as keyof typeof FREQS)}>{Object.entries(FREQS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div><div><label>Ano</label><select value={groupYear} onChange={e=>setGroupYear(+e.target.value)}>{YEARS.map(y=><option key={y} value={y}>{y}{y===2025?' (Jan–Set)':''}</option>)}</select></div><div className="sectionSelect"><label>Grupo de produtos</label><select value={section} onChange={e=>setSection(e.target.value)}>{SECTIONS.map(([k,n])=><option key={k} value={k}>{k} — {n}</option>)}</select></div></div>
   <article className="chartCard groupChart"><div className="cardTitle"><div><span className="micro">GRUPO {section}</span><h3>{SECTIONS.find(x=>x[0]===section)?.[1]} · {groupFlow}</h3></div><span className="unit">{FREQS[groupFreq]} · {groupYear}</span></div><LineChart rows={groupRows} flow={groupFlow} label={`Grupo ${section} ${groupFlow}`}/></article>
   <div className="tableWrap"><table><thead><tr><th>Período</th><th>Exportações</th><th>Importações</th><th>Global</th><th>SH8 Exp.</th><th>SH8 Imp.</th></tr></thead><tbody>{groupRows.map((r:any)=><tr key={r.period}><td>{r.period}</td><td>{fmt(r.Exportações?.index)}</td><td>{fmt(r.Importações?.index)}</td><td>{fmt(r.Global?.index)}</td><td>{r.Exportações?.eligible_sh8??'—'}</td><td>{r.Importações?.eligible_sh8??'—'}</td></tr>)}</tbody></table></div>
   <h3 className="snapshotTitle">Painel dos 21 grupos · último período disponível</h3><div className="groupGrid">{SECTIONS.map(([key,name])=>{const r=groupSnapshot.find((x:any)=>x.section===key);return <button key={key} className={section===key?'selected':''} onClick={()=>setSection(key)}><span>{key}</span><h3>{name}</h3><p>{groupFlow}: <b>{fmt(r?.[groupFlow]?.index)}</b></p></button>})}</div>
  </section>

  <section className="method"><div className="wrap methodGrid"><div><p className="eyebrow">METODOLOGIA E GOVERNAÇÃO</p><h2>Qualidade, rastreabilidade e integração institucional</h2><p>IVU com base 2022=100, cabaz fixo, filtros mínimos, controlo de dispersão e ponderação pelo valor. A integração com o Portal do Comércio Externo será conduzida por um Grupo Técnico ICE–Portal, com validação estatística e tecnológica antes de cada publicação.</p></div><ol><li>Validar fontes e unidades</li><li>Calcular por SH8 e período</li><li>Agregar por fluxo e Secção SH</li><li>Homologar resultados na DNCE</li><li>Publicar e documentar a versão</li></ol></div></section>

  <section className="wrap downloads" id="downloads"><div className="sectionHead"><div><p className="eyebrow dark">ANEXOS, MANUAIS E FONTES</p><h2>Relatório e apresentação do Índice</h2></div><p>A estrutura editorial da primeira versão foi recuperada. Consulte ou descarregue as versões finais, com Exportações, Importações e Índice Global.</p></div>
   <div className="featuredDownloads">
    <article className="documentCard"><span className="pdfBadge">PDF</span><p className="docMeta">ANEXO I · RELATÓRIO · AGO 2026</p><h3>Documento Técnico Consolidado dos Índices do Comércio Externo</h3><p>Metodologia, tratamento dos dados, índices mensais, trimestrais, semestrais e anuais, 21 grupos de produtos, previsão 2026 e resultados dos três fluxos.</p><div className="docTags"><span>Relatório final</span><span>PDF e Word</span><span>Base 2022=100</span></div><div className="docActions"><a href="/downloads/Relatorio_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf" target="_blank">Consultar ↗</a><a className="outline" href="/downloads/Relatorio_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf" download>Descarregar PDF ↓</a><a className="textLink" href="/downloads/Relatorio_Final_ICE_Mocambique_2022_2025_Previsao_2026.docx" download>Word editável</a></div></article>
    <article className="documentCard"><span className="pdfBadge">PDF</span><p className="docMeta">ANEXO II · APRESENTAÇÃO · AGO 2026</p><h3>Índices do Comércio Externo de Moçambique</h3><p>Narrativa executiva com qualidade dos dados, metodologia, Exportações, Importações, Índice Global, resultados por periodicidade e decisões propostas.</p><div className="docTags"><span>Apresentação final</span><span>PDF e PowerPoint</span><span>Formato 16:9</span></div><div className="docActions"><a href="/downloads/Apresentacao_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf" target="_blank">Consultar ↗</a><a className="outline" href="/downloads/Apresentacao_Final_ICE_Mocambique_2022_2025_Previsao_2026.pdf" download>Descarregar PDF ↓</a><a className="textLink" href="/downloads/Apresentacao_Final_ICE_Mocambique_2022_2025_Previsao_2026.pptx" download>PowerPoint editável</a></div></article>
    <aside className="annexSummary"><p className="eyebrow">CONTEÚDO DOS ANEXOS</p><h3>Documentação de suporte à decisão</h3><ul><li>Fundamentação económica e institucional</li><li>Fontes e estrutura dos dados</li><li>Metodologia de cálculo do IVU</li><li>Laspeyres, Paasche e Fisher</li><li>Critérios de qualidade e outliers</li><li>Resultados 2022–2025 e previsão 2026</li><li>21 Secções do Sistema Harmonizado</li><li>Fluxo operacional e sintaxes SPSS</li></ul></aside>
   </div>
   <div className="supportHead"><h3>Outros ficheiros e instrumentos de apoio</h3><p>Resultados em Excel, fontes públicas, Manual de Utilização e Plano de Capacitação.</p></div><div className="downloadGrid supportGrid">{SUPPORT_DOWNLOADS.map(([title,type,file])=><a key={file} href={'/downloads/'+file} download><span>{type}</span><h3>{title}</h3><b>Descarregar ↓</b></a>)}</div>
  </section>
  <footer><div className="wrap"><b>Ministério da Economia · Direcção Nacional do Comércio Externo</b><span>Plataforma ICE · Versão Agosto 2026</span></div></footer>
 </main>
}

"use client";

import { useMemo, useState } from "react";

const series = {
  Reajustado: [100, 98.48, 118.76, 101.29],
  Fisher: [100, 96.32, 110.93, 97.93],
  Laspeyres: [100, 94.7, 114.2, 95.4],
  Paasche: [100, 97.97, 107.75, 100.52],
};
const years = [2022, 2023, 2024, 2025];
const aggregateIndices = [
  {fluxo:"Exportações", valores:[100,101.28,120.04,98.04], nota:"Índice ajustado do fluxo exportador"},
  {fluxo:"Importações", valores:[100,88.96,82.81,80.03], nota:"Índice ajustado do fluxo importador"},
  {fluxo:"Global", valores:[100,95.42,102.33,89.47], nota:"Índice ponderado pelos valores elegíveis de 2022"},
];
const tradeRecords = [
  {sh:"26140000",produto:"Minérios de titânio",fluxo:"Exportações",ano:2023,indice:88.55,peso:23.66,estado:"Validado"},
  {sh:"07139010",produto:"Leguminosas secas",fluxo:"Exportações",ano:2023,indice:108.31,peso:9.56,estado:"Validado"},
  {sh:"12019000",produto:"Soja",fluxo:"Exportações",ano:2023,indice:225.62,peso:3.49,estado:"Em validação"},
  {sh:"12024200",produto:"Amendoim",fluxo:"Exportações",ano:2023,indice:133.45,peso:5.08,estado:"Validado"},
  {sh:"26151000",produto:"Minérios de zircónio",fluxo:"Exportações",ano:2023,indice:90.95,peso:6.21,estado:"Validado"},
  {sh:"27011900",produto:"Carvão mineral",fluxo:"Exportações",ano:2022,indice:100,peso:26.28,estado:"Validado"},
  {sh:"76011000",produto:"Alumínio não ligado",fluxo:"Exportações",ano:2022,indice:100,peso:21.38,estado:"Validado"},
  {sh:"27111100",produto:"Gás natural liquefeito",fluxo:"Exportações",ano:2025,indice:417.04,peso:64.98,estado:"Em validação"},
  {sh:"27101939",produto:"Outros óleos de petróleo",fluxo:"Importações",ano:2024,indice:112.84,peso:18.42,estado:"Validado"},
  {sh:"87032319",produto:"Veículos de passageiros",fluxo:"Importações",ano:2025,indice:106.23,peso:7.18,estado:"Em validação"},
];

const syntaxBlocks = {
  importacao: `GET DATA\n /TYPE=XLSX\n /FILE='Base_Comercio_Externo.xlsx'\n /SHEET=name 'Base'\n /READNAMES=ON.\nDATASET NAME Comercio_Externo.`,
  qualidade: `SELECT IF (SumOfMilUSD > 0 AND SumOfquantity > 0).\nCOMPUTE VU = (SumOfMilUSD * 1000) / SumOfquantity.\nAGGREGATE OUTFILE=* MODE=ADDVARIABLES\n /BREAK=SH8 year\n /MEDIANA=MEDIAN(VU) /MEDIA=MEAN(VU) /DP=SD(VU).\nCOMPUTE CV=(DP/MEDIA)*100.`,
  indice: `COMPUTE IVU=(VU/VU_BASE)*100.\nCOMPUTE PESO=VALOR_2022/VALOR_TOTAL_2022.\nCOMPUTE IVU_POND=IVU*PESO.\nAGGREGATE OUTFILE='Indice_Global.sav'\n /BREAK=REGIME year\n /INDICE_GLOBAL=SUM(IVU_POND).`,
};

const productSections = [
  {n:"I",cap:"01–05",nome:"Animais vivos e produtos do reino animal",ex:"Animais, carnes, peixes, leite, ovos e outros produtos de origem animal"},
  {n:"II",cap:"06–14",nome:"Produtos do reino vegetal",ex:"Plantas, hortícolas, frutas, café, cereais, sementes, gomas e matérias vegetais"},
  {n:"III",cap:"15",nome:"Gorduras e óleos animais ou vegetais",ex:"Óleos alimentares, gorduras, ceras animais e vegetais"},
  {n:"IV",cap:"16–24",nome:"Produtos alimentares, bebidas e tabaco",ex:"Preparações de carne e peixe, açúcar, cacau, bebidas, resíduos alimentares e tabaco"},
  {n:"V",cap:"25–27",nome:"Produtos minerais",ex:"Sal, enxofre, minérios, combustíveis minerais, petróleo, carvão e gás natural"},
  {n:"VI",cap:"28–38",nome:"Produtos das indústrias químicas",ex:"Químicos, fertilizantes, farmacêuticos, cosméticos, sabões, explosivos e pesticidas"},
  {n:"VII",cap:"39–40",nome:"Plásticos, borracha e suas obras",ex:"Matérias plásticas, embalagens, tubos, pneus e outros artigos de borracha"},
  {n:"VIII",cap:"41–43",nome:"Peles, couros e suas obras",ex:"Couros, artigos de viagem, bolsas, peles com pelo e respectivas obras"},
  {n:"IX",cap:"44–46",nome:"Madeira, cortiça e cestaria",ex:"Madeira e suas obras, carvão vegetal, cortiça, espartaria e cestaria"},
  {n:"X",cap:"47–49",nome:"Pastas de madeira, papel e cartão",ex:"Celulose, papel, cartão, livros, jornais e produtos das artes gráficas"},
  {n:"XI",cap:"50–63",nome:"Matérias têxteis e suas obras",ex:"Seda, algodão, fibras, tecidos, vestuário, tapetes e artigos têxteis confeccionados"},
  {n:"XII",cap:"64–67",nome:"Calçado, chapéus e artigos semelhantes",ex:"Calçado, polainas, chapéus, guarda-chuvas, penas preparadas e flores artificiais"},
  {n:"XIII",cap:"68–70",nome:"Pedra, cimento, cerâmica e vidro",ex:"Obras de pedra e cimento, produtos cerâmicos, vidro e suas obras"},
  {n:"XIV",cap:"71",nome:"Pérolas, pedras e metais preciosos",ex:"Diamantes, pedras preciosas, ouro, prata, joalharia e moedas"},
  {n:"XV",cap:"72–83",nome:"Metais comuns e suas obras",ex:"Ferro, aço, cobre, níquel, alumínio, chumbo, zinco, estanho e ferramentas"},
  {n:"XVI",cap:"84–85",nome:"Máquinas, aparelhos e material eléctrico",ex:"Máquinas, equipamentos mecânicos, computadores, aparelhos eléctricos e electrónicos"},
  {n:"XVII",cap:"86–89",nome:"Material de transporte",ex:"Veículos, tractores, comboios, aeronaves, embarcações e respectivas partes"},
  {n:"XVIII",cap:"90–92",nome:"Instrumentos de óptica, precisão e música",ex:"Equipamento médico, instrumentos de medição, relógios e instrumentos musicais"},
  {n:"XIX",cap:"93",nome:"Armas e munições",ex:"Armas, munições, suas partes e acessórios"},
  {n:"XX",cap:"94–96",nome:"Mercadorias e produtos diversos",ex:"Mobiliário, iluminação, brinquedos, artigos de desporto e manufacturas diversas"},
  {n:"XXI",cap:"97",nome:"Objectos de arte e antiguidades",ex:"Obras de arte, peças de colecção e antiguidades"},
];

const sectionResults: Record<string, Array<number|null>> = {
  I:[100,111.96,105.95,112.80], II:[100,128.01,130.34,121.59], III:[100,87.71,75.21,144.83],
  IV:[100,98.04,85.89,94.30], V:[100,88.55,118.89,86.28], VI:[100,74.51,56.49,56.61],
  VII:[100,66.59,78.48,73.21], VIII:[100,35.72,70.38,null], IX:[100,103.73,182.16,159.34],
  X:[100,92.15,88.45,143.23], XI:[100,107.13,87.52,100.71], XII:[100,null,null,null],
  XIII:[100,null,51.72,47.42], XIV:[100,108.59,131.20,160.83], XV:[100,79.26,119.56,84.26],
  XVI:[100,80.05,120.79,196.04], XVII:[null,null,null,null], XVIII:[null,null,null,null],
  XIX:[null,null,null,null], XX:[100,178.92,209.30,null], XXI:[null,null,null,null],
};
const importSectionResults: Record<string, Array<number|null>> = {
  I:[100,106.67,84.77,85.59], II:[100,78.96,88.73,87.33], III:[100,87.87,95.62,89.87],
  IV:[100,82.84,85.00,74.03], V:[100,92.83,77.08,76.92], VI:[100,86.54,83.02,79.17],
  VII:[100,79.39,74.52,67.62], VIII:[null,null,null,null], IX:[100,null,40.69,45.57],
  X:[100,88.56,117.97,66.27], XI:[100,109.85,45.62,57.23], XII:[null,null,null,null],
  XIII:[100,113.86,111.77,99.74], XIV:[100,81.30,87.93,147.88], XV:[100,82.45,80.25,64.34],
  XVI:[100,85.55,68.46,89.93], XVII:[100,99.54,73.67,24.93], XVIII:[100,null,null,null],
  XIX:[null,null,null,null], XX:[100,60.21,101.57,71.96], XXI:[null,null,null,null],
};
const globalExportIndex=[100,101.28,120.04,98.04];
const globalImportIndex=[100,88.96,82.81,80.03];
const fmtIndex=(v:number|null)=>v===null?"N/D":v.toFixed(2).replace(".",",");

function TrendChart({method}:{method:keyof typeof series}) {
  const data=series[method];
  const points=data.map((v,i)=>`${34+i*108},${145-(v-85)*3}`).join(" ");
  return <div className="chart-wrap" aria-label={`Evolução do índice ${method}`}>
    <svg viewBox="0 0 390 180" role="img">
      {[25,65,105,145].map((y,i)=><g key={y}><line x1="30" y1={y} x2="365" y2={y} className="gridline"/><text x="2" y={y+4}>{[125,115,105,95][i]}</text></g>)}
      <polyline points={points} className="trend-line"/>
      {data.map((v,i)=><g key={i}><circle cx={34+i*108} cy={145-(v-85)*3} r="5"/><text className="value" x={34+i*108} y={132-(v-85)*3}>{v.toFixed(2).replace(".",",")}</text><text x={34+i*108} y="171" textAnchor="middle">{years[i]}</text></g>)}
    </svg>
  </div>
}

function Icon({name}:{name:"download"|"arrow"|"check"}) { return <span aria-hidden>{name==="download"?"↓":name==="arrow"?"↗":"✓"}</span> }

export default function Home() {
  const [method,setMethod]=useState<keyof typeof series>("Fisher");
  const [flow,setFlow]=useState("Exportações");
  const [aggregateFlow,setAggregateFlow]=useState("Global");
  const [year,setYear]=useState(2025);
  const [query,setQuery]=useState("");
  const [resultLevel,setResultLevel]=useState<"seccoes"|"sh8">("seccoes");
  const [sectionFlow,setSectionFlow]=useState<"Exportações"|"Importações">("Exportações");
  const [dataFlow,setDataFlow]=useState("Todos");
  const [dataYear,setDataYear]=useState("Todos");
  const [dataTab,setDataTab]=useState<"tabela"|"produtos"|"catalogo"|"qualidade">("tabela");
  const [sectionQuery,setSectionQuery]=useState("");
  const [syntax,setSyntax]=useState<keyof typeof syntaxBlocks>("importacao");
  const current=useMemo(()=>series[method][years.indexOf(year)], [method,year]);
  const filteredRecords=useMemo(()=>tradeRecords.filter(r=>(dataFlow==="Todos"||r.fluxo===dataFlow)&&(dataYear==="Todos"||r.ano===Number(dataYear))&&(`${r.sh} ${r.produto}`.toLowerCase().includes(query.toLowerCase()))),[query,dataFlow,dataYear]);
  const filteredSections=useMemo(()=>productSections.filter(s=>`${s.n} ${s.cap} ${s.nome} ${s.ex}`.toLowerCase().includes(query.toLowerCase())),[query]);
  const activeSectionResults=sectionFlow==="Exportações"?sectionResults:importSectionResults;
  const activeFlowIndex=sectionFlow==="Exportações"?globalExportIndex:globalImportIndex;
  const downloadCsv=()=>{const rows=resultLevel==="seccoes"?[["Fluxo","Secção","Capítulos SH2","Tipo de produto","2022","2023","2024","2025","Estado"],...filteredSections.map(s=>[sectionFlow,s.n,s.cap,s.nome,...activeSectionResults[s.n].map(fmtIndex),"Calculado pela metodologia ajustada"])]:[["SH8","Produto","Fluxo","Ano","IVU","Peso (%)","Estado"],...filteredRecords.map(r=>[r.sh,r.produto,r.fluxo,r.ano,r.indice,r.peso,r.estado])];const csv=rows.map(row=>row.map(v=>`"${v}"`).join(";")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));a.download=resultLevel==="seccoes"?`ICE_21_Grupos_${sectionFlow}.csv`:"ICE_Resultados_SH8.csv";a.click();URL.revokeObjectURL(a.href)};
  const copySyntax=async()=>{await navigator.clipboard.writeText(syntaxBlocks[syntax]);alert("Sintaxe SPSS copiada.")};
  return <main>
    <header className="topbar">
      <a className="brand" href="#inicio"><span className="emblem">M</span><span>REPÚBLICA DE MOÇAMBIQUE<small>MINISTÉRIO DA ECONOMIA · DNCE</small></span></a>
      <nav><a href="#resultados">Resultados</a><a href="#centro-dados">Centro de Dados</a><a href="#spss">SPSS</a><a href="#metodologia">Metodologia</a><a href="#documentos">Publicações</a></nav>
      <a className="nav-cta" href="#centro-dados">Abrir dados <Icon name="arrow"/></a>
    </header>

    <section className="hero" id="inicio">
      <div className="hero-copy">
        <div className="eyebrow"><span></span> Estatísticas do Comércio Externo</div>
        <h1>Índices do<br/><em>Comércio Externo</em><br/>de Moçambique</h1>
        <p>Uma plataforma para compreender a evolução dos preços implícitos, quantidades e valores das exportações e importações — com base 2022 = 100.</p>
        <div className="hero-actions"><a className="button primary" href="#resultados">Explorar resultados <Icon name="arrow"/></a><a className="button ghost" href="#metodologia">Conhecer a metodologia</a></div>
        <div className="status"><span className="dot"></span><b>Série preliminar em validação técnica</b><small>Actualização: Julho de 2026</small></div>
      </div>
      <div className="hero-visual">
        <div className="big-index"><span>Índice de referência</span><strong>{current.toFixed(2).replace(".",",")}</strong><small>{year} · {flow} · {method}</small></div>
        <svg className="hero-chart" viewBox="0 0 560 290" aria-hidden><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4b400" stopOpacity=".35"/><stop offset="1" stopColor="#f4b400" stopOpacity="0"/></linearGradient></defs><path d="M20 240 C80 220 110 160 165 180 S245 235 300 150 S385 80 435 105 S500 55 540 35 L540 270 L20 270Z" fill="url(#fill)"/><path d="M20 240 C80 220 110 160 165 180 S245 235 300 150 S385 80 435 105 S500 55 540 35" fill="none" stroke="#f4b400" strokeWidth="5"/><circle cx="540" cy="35" r="8" fill="#f4b400"/></svg>
        <div className="visual-note"><b>2022</b><span>Ano-base</span><b>100</b></div>
      </div>
    </section>

    <section className="section aggregate-results" id="resultados">
      <div className="section-head"><div><div className="kicker">RESULTADOS CONSOLIDADOS</div><h2>Exportações, importações e índice global</h2><p>Índices ajustados, base 2022 = 100. O índice global pondera exportações (52,44%) e importações (47,56%) pelos valores elegíveis do ano-base.</p></div><span className="validation">Série 2022–2025</span></div>
      <div className="flow-switch" role="tablist" aria-label="Seleccionar índice">{aggregateIndices.map(item=><button role="tab" aria-selected={aggregateFlow===item.fluxo} className={aggregateFlow===item.fluxo?"active":""} onClick={()=>setAggregateFlow(item.fluxo)} key={item.fluxo}>{item.fluxo}</button>)}</div>
      {aggregateIndices.filter(item=>item.fluxo===aggregateFlow).map(item=><div className="aggregate-focus" key={item.fluxo}><div><span>ÍNDICE {item.fluxo.toUpperCase()}</span><strong>{fmtIndex(item.valores[3])}</strong><small>2025 · base 2022 = 100</small><p>{item.nota}</p></div><div className="aggregate-years">{years.map((y,i)=><article key={y}><span>{y}</span><b>{fmtIndex(item.valores[i])}</b></article>)}</div></div>)}
      <div className="table-scroll aggregate-table"><table><thead><tr><th>Índice</th>{years.map(y=><th key={y}>{y}</th>)}<th>Definição</th></tr></thead><tbody>{aggregateIndices.map(item=><tr key={item.fluxo}><td><strong>{item.fluxo}</strong></td>{item.valores.map((v,i)=><td key={i} className="index-data">{fmtIndex(v)}</td>)}<td>{item.nota}</td></tr>)}</tbody></table></div>
      <div className="formula-note"><b>Fórmula do índice global:</b> 0,5244 × ICE Exportações + 0,4756 × ICE Importações. Em 2025: 89,47.</div>
    </section>

    <section className="section data-center" id="centro-dados">
      <div className="section-head"><div><div className="kicker">CENTRO DE DADOS</div><h2>Explore, filtre e exporte os resultados</h2><p>Consulte os três índices agregados e os 21 grupos calculados separadamente para exportações e importações.</p></div><button className="button export" onClick={downloadCsv}><Icon name="download"/> Exportar CSV</button></div>
      <div className="data-tabs"><button className={dataTab==="tabela"?"active":""} onClick={()=>setDataTab("tabela")}>Tabela de resultados</button><button className={dataTab==="produtos"?"active":""} onClick={()=>setDataTab("produtos")}>21 tipos de produtos</button><button className={dataTab==="catalogo"?"active":""} onClick={()=>setDataTab("catalogo")}>Catálogo de indicadores</button><button className={dataTab==="qualidade"?"active":""} onClick={()=>setDataTab("qualidade")}>Estado dos dados</button></div>
      {dataTab==="tabela"&&<><div className="result-level"><span>Nível da tabela</span><button className={resultLevel==="seccoes"?"active":""} onClick={()=>setResultLevel("seccoes")}>21 grupos — Secções SH</button><button className={resultLevel==="sh8"?"active":""} onClick={()=>setResultLevel("sh8")}>Produtos SH8</button><b>{resultLevel==="seccoes"?"21 grupos · resultados ajustados":"Amostra de resultados por produto"}</b></div>{resultLevel==="seccoes"&&<div className="flow-switch" role="tablist" aria-label="Seleccionar fluxo dos 21 grupos"><button className={sectionFlow==="Exportações"?"active":""} onClick={()=>setSectionFlow("Exportações")}>Exportações</button><button className={sectionFlow==="Importações"?"active":""} onClick={()=>setSectionFlow("Importações")}>Importações</button></div>}<div className={`data-filters ${resultLevel==="seccoes"?"sections-filter":""}`}><label className="searchbox">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder={resultLevel==="seccoes"?"Pesquisar Secção, capítulos ou tipo de produto…":"Pesquisar código SH8 ou produto…"}/></label>{resultLevel==="sh8"&&<><select value={dataFlow} onChange={e=>setDataFlow(e.target.value)}><option>Todos</option><option>Exportações</option><option>Importações</option></select><select value={dataYear} onChange={e=>setDataYear(e.target.value)}><option>Todos</option>{years.map(y=><option key={y}>{y}</option>)}</select></>}<span>{resultLevel==="seccoes"?filteredSections.length:filteredRecords.length} registos</span></div><div className="table-scroll">{resultLevel==="seccoes"?<><table className="sections-table validated-table"><thead><tr><th>Secção</th><th>Capítulos SH2</th><th>Tipo de produto</th><th>2022</th><th>2023</th><th>2024</th><th>2025</th><th>Estado</th></tr></thead><tbody>{filteredSections.map(s=><tr key={s.n}><td><span className="section-pill">{s.n}</span></td><td><b>{s.cap}</b></td><td><strong>{s.nome}</strong><small>{s.ex}</small></td>{activeSectionResults[s.n].map((v,i)=><td key={i} className={v===null?"no-data":"index-data"}>{fmtIndex(v)}</td>)}<td><span className="tag-valid">Calculado</span></td></tr>)}<tr className="global-row"><td colSpan={3}><strong>Índice ajustado — {sectionFlow}</strong><small>Base 2022 = 100</small></td>{activeFlowIndex.map((v,i)=><td key={i}>{fmtIndex(v)}</td>)}<td><span className="tag-valid">Calculado</span></td></tr></tbody></table>{!filteredSections.length&&<div className="empty">Nenhum grupo corresponde à pesquisa.</div>}</>:<><table><thead><tr><th>Código SH8</th><th>Produto</th><th>Fluxo</th><th>Ano</th><th>IVU</th><th>Peso</th><th>Estado</th></tr></thead><tbody>{filteredRecords.map((r,i)=><tr key={i}><td><b>{r.sh}</b></td><td>{r.produto}</td><td>{r.fluxo}</td><td>{r.ano}</td><td>{r.indice.toFixed(2).replace(".",",")}</td><td>{r.peso.toFixed(2).replace(".",",")}%</td><td><span className={r.estado==="Validado"?"tag-valid":"tag-pending"}>{r.estado}</span></td></tr>)}</tbody></table>{!filteredRecords.length&&<div className="empty">Nenhum registo corresponde aos filtros seleccionados.</div>}</>}</div><div className="table-disclaimer validated-note"><b>Resultados calculados:</b> IVU por Secção SH e fluxo, base 2022=100. “N/D” indica ausência de observações elegíveis suficientes.</div></>}
      {dataTab==="produtos"&&<div className="product-sections"><div className="section-summary"><div><b>21</b><span>Secções do Sistema Harmonizado</span></div><p>Os “21 tipos de produtos” correspondem às 21 Secções da classificação SH2022. Abra cada grupo para ver os capítulos e exemplos de mercadorias.</p><label className="searchbox">⌕<input value={sectionQuery} onChange={e=>setSectionQuery(e.target.value)} placeholder="Pesquisar tipo de produto…"/></label></div><div className="section-grid">{productSections.filter(s=>`${s.nome} ${s.ex} ${s.cap}`.toLowerCase().includes(sectionQuery.toLowerCase())).map(s=><details key={s.n}><summary><span className="roman">{s.n}</span><span><small>SECÇÃO {s.n} · CAPÍTULOS {s.cap}</small><b>{s.nome}</b></span><i>+</i></summary><div><p>{s.ex}</p><span>Classificação de referência: SH2022</span></div></details>)}</div>{!productSections.filter(s=>`${s.nome} ${s.ex} ${s.cap}`.toLowerCase().includes(sectionQuery.toLowerCase())).length&&<div className="empty">Nenhum tipo de produto corresponde à pesquisa.</div>}<div className="section-note"><b>Como utilizar:</b> primeiro seleccione a Secção, depois aprofunde a análise por capítulo SH2, grupo SH4 e produto SH8.</div></div>}
      {dataTab==="catalogo"&&<div className="catalog-grid">{[["IVU","Índice de Valor Unitário","Variação do preço implícito das mercadorias."],["IQ","Índice de Quantidade","Evolução do volume físico transaccionado."],["IV","Índice de Valor","Variação do valor total do comércio."],["TT","Termos de Troca","Relação entre IVU de exportações e importações."],["Fisher","Índice de referência","Média geométrica de Laspeyres e Paasche."],["Contribuição","Impacto ponderado","Influência de cada SH8 no índice agregado."]].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p><small>Base 2022 = 100</small></article>)}</div>}
      {dataTab==="qualidade"&&<div className="data-status"><div className="donut"><b>2.955</b><span>resultados SH8 preservados</span></div><div><h3>Estado de preparação</h3>{[["Base 2022–2025 organizada",100],["Sintaxes SPSS consolidadas",100],["Critérios de selecção documentados",90],["Validação do cabaz e pesos",70],["Recálculo das periodicidades",45],["Homologação institucional",25]].map(x=><div className="progress" key={String(x[0])}><span>{x[0]} <b>{x[1]}%</b></span><i><em style={{width:`${x[1]}%`}}/></i></div>)}</div></div>}
      <div className="data-foot"><span>Fontes: JUE/Autoridade Tributária · Banco de Moçambique · INE · SH2022</span><span>Unidades: FOB para exportações · CIF para importações</span></div>
    </section>

    <section className="section spss" id="spss">
      <div className="spss-intro"><div className="kicker light">LABORATÓRIO SPSS</div><h2>Do ficheiro bruto ao índice reproduzível</h2><p>O IBM SPSS Statistics 25 foi utilizado para importar, harmonizar, validar, agregar e calcular os índices. As sintaxes garantem rastreabilidade, repetição do processo e redução de erros manuais.</p><div className="spss-badges"><span>.SAV Base de dados</span><span>.SPS Sintaxe</span><span>.XLSX Resultados</span><span>.CSV Intercâmbio</span></div></div>
      <div className="code-lab"><div className="code-tabs"><button className={syntax==="importacao"?"active":""} onClick={()=>setSyntax("importacao")}>1. Importação</button><button className={syntax==="qualidade"?"active":""} onClick={()=>setSyntax("qualidade")}>2. Qualidade</button><button className={syntax==="indice"?"active":""} onClick={()=>setSyntax("indice")}>3. Índice</button></div><pre><code>{syntaxBlocks[syntax]}</code></pre><button className="copy" onClick={copySyntax}>Copiar sintaxe</button></div>
      <div className="spss-flow">{[["01","Importar","XLSX/CSV e nomes de variáveis"],["02","Preparar","SH8, datas, fluxos e unidades"],["03","Validar","Positivos, frequência, CV e outliers"],["04","Calcular","VU, pesos, LPF e contribuições"],["05","Exportar","SAV, Excel, CSV e Power BI"]].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div>
      <div className="dictionary"><div><span>DICIONÁRIO MÍNIMO</span><h3>Variáveis essenciais</h3><p>Cada campo deve ter nome, tipo, unidade, domínio, fonte e regra de validação documentados.</p></div><div className="dict-list">{[["REGIME","Exportação ou Importação"],["year / month","Ano e mês de referência"],["SH8","Código do produto — 8 dígitos"],["SumOfMilUSD","Valor comercial em mil USD"],["SumOfquantity","Quantidade declarada"],["unit","Unidade de medida"],["VU / VU_BASE","Valor unitário actual e base"],["PESO / IVU_POND","Ponderador e contribuição"]].map(x=><p key={x[0]}><b>{x[0]}</b><span>{x[1]}</span></p>)}</div></div>
    </section>

    <section className="quick-stats">
      <article><span>Período coberto</span><b>2022—2025</b><small>4 anos de observações</small></article>
      <article><span>Detalhe máximo</span><b>SH8</b><small>Produto → Total nacional</small></article>
      <article><span>Periodicidade</span><b>Trimestral</b><small>Mensal · Semestral · Anual</small></article>
      <article><span>Método proposto</span><b>Fisher</b><small>Laspeyres + Paasche</small></article>
    </section>

    <section className="section results" id="resultados">
      <div className="section-head"><div><div className="kicker">PAINEL ESTATÍSTICO</div><h2>Leia a dinâmica do comércio</h2><p>Compare métodos e acompanhe a evolução da série reajustada. Os valores abaixo são preliminares e aguardam homologação institucional.</p></div><span className="validation">● Em validação</span></div>
      <div className="filters">
        <label>Fluxo<select value={flow} onChange={e=>setFlow(e.target.value)}><option>Exportações</option><option>Importações</option></select></label>
        <label>Método<select value={method} onChange={e=>setMethod(e.target.value as keyof typeof series)}><option>Fisher</option><option>Reajustado</option><option>Laspeyres</option><option>Paasche</option></select></label>
        <label>Ano<select value={year} onChange={e=>setYear(Number(e.target.value))}>{years.map(y=><option key={y}>{y}</option>)}</select></label>
      </div>
      <div className="dashboard-grid">
        <article className="chart-card wide"><div className="card-title"><div><span>ÍNDICE DE VALOR UNITÁRIO</span><h3>Evolução anual · {method}</h3></div><b>Base 2022 = 100</b></div><TrendChart method={method}/></article>
        <article className="metric-card"><span>Resultado seleccionado</span><strong>{current.toFixed(2).replace(".",",")}</strong><b className={current>=100?"up":"down"}>{current>=100?"▲":"▼"} {Math.abs(current-100).toFixed(2).replace(".",",")}% face à base</b><p>O valor unitário é um preço implícito. Mudanças de composição e qualidade podem afectar a leitura.</p></article>
        <article className="method-card"><span>ROBUSTEZ METODOLÓGICA</span><h3>Três lentes, uma decisão</h3><div className="method-bars">{(["Laspeyres","Paasche","Fisher"] as const).map(m=><button key={m} onClick={()=>setMethod(m)} className={method===m?"active":""}><span>{m}</span><b>{series[m][3].toFixed(2).replace(".",",")}</b></button>)}</div></article>
      </div>
      <div className="warning"><b>Nota técnica</b><p>A repetição do índice anual em versões mensais, trimestrais e semestrais anteriores foi identificada como erro de agregação. As periodicidades serão publicadas após recálculo a partir das transacções de cada período.</p></div>
    </section>

    <section className="section methodology" id="metodologia">
      <div className="kicker light">COMO É CALCULADO</div><h2>Do registo aduaneiro à evidência económica</h2><p className="lead">Um processo auditável transforma dados administrativos da JUE em estatísticas comparáveis para política comercial.</p>
      <div className="process">{[["01","Dados","Declarações JUE; exportações FOB e importações CIF."],["02","Harmonização","SH2017 → SH2022, valores, datas e unidades."],["03","Qualidade","Cabaz contínuo, estabilidade, dispersão e outliers."],["04","Cálculo","SH8 → SH2 → Secção → Total nacional."],["05","Validação","Revisão técnica e aprovação institucional."]].map(x=><article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>)}</div>
      <div className="formula-grid"><article><span>CONCEITO CENTRAL</span><h3>Valor unitário</h3><div className="formula">VU<sub>it</sub> = V<sub>it</sub> ÷ Q<sub>it</sub></div><p>Uma aproximação do preço médio implícito por produto e período.</p></article><article><span>ÍNDICE DE REFERÊNCIA</span><h3>Fisher</h3><div className="formula">I<sup>F</sup> = √(I<sup>L</sup> × I<sup>P</sup>)</div><p>Equilibra a estrutura do ano-base com a estrutura corrente.</p></article><article><span>TERMOS DE TROCA</span><h3>Relação externa</h3><div className="formula">TT = IVU<sub>X</sub> ÷ IVU<sub>M</sub> × 100</div><p>Compara preços implícitos das exportações e importações.</p></article></div>
    </section>

    <section className="section quality" id="qualidade">
      <div><div className="kicker">CONTROLO DE QUALIDADE</div><h2>Cinco testes protegem o índice</h2><p>O cabaz procura equilíbrio entre continuidade, representatividade e estabilidade estatística.</p></div>
      <div className="test-grid">{[["≥ 6","ocorrências por ano"],["≤ 10","Máximo ÷ Mínimo"],["≤ 5","Máximo ÷ Mediana"],["≤ 5","Mediana ÷ Mínimo"],["≤ 30%","Coeficiente de variação"]].map((x,i)=><article key={i}><span><Icon name="check"/></span><b>{x[0]}</b><p>{x[1]}</p></article>)}</div>
      <div className="quality-legend"><span className="ok">● Validado</span><span className="pending">● Em validação</span><span className="rejected">● Rejeitado</span><p>Outliers acima de 1.000%, unidades incompatíveis e produtos sem base comparável exigem revisão antes da divulgação.</p></div>
    </section>

    <section className="section documents" id="documentos">
      <div className="section-head"><div><div className="kicker">ANEXOS EM PDF</div><h2>Relatório e apresentação do Índice</h2><p>Documentos atualizados com Exportações, Importações, Índice Global ponderado e resultados dos 21 grupos.</p></div><a className="button annex-all" href="/anexos/Relatorio_Tecnico_Indices_Comercio_Externo.pdf" target="_blank" rel="noreferrer">Abrir relatório completo <Icon name="arrow"/></a></div>
      <div className="doc-grid annex-grid">
        <article className="annex-card"><div className="pdf-mark">PDF</div><span className="doc-type">ANEXO I · RELATÓRIO · AGO 2026</span><h3>Documento Técnico Consolidado dos Índices do Comércio Externo</h3><p>41 páginas com metodologia, auditoria e resultados ajustados dos três índices e dos 21 grupos de importações.</p><div className="annex-meta"><span>41 páginas</span><span>PDF</span><span>Formato A4/Carta</span></div><div className="annex-actions"><a href="/anexos/Relatorio_Tecnico_Indices_Comercio_Externo.pdf" target="_blank" rel="noreferrer">Consultar <Icon name="arrow"/></a><a href="/anexos/Relatorio_Tecnico_Indices_Comercio_Externo.pdf" download>Descarregar <Icon name="download"/></a></div></article>
        <article className="annex-card"><div className="pdf-mark">PDF</div><span className="doc-type">ANEXO II · APRESENTAÇÃO · AGO 2026</span><h3>Índices do Comércio Externo de Moçambique</h3><p>22 diapositivos, com síntese executiva dos índices ajustados de Exportações, Importações e Global.</p><div className="annex-meta"><span>22 diapositivos</span><span>PDF</span><span>Formato 16:9</span></div><div className="annex-actions"><a href="/anexos/Apresentacao_Indices_Comercio_Externo.pdf" target="_blank" rel="noreferrer">Consultar <Icon name="arrow"/></a><a href="/anexos/Apresentacao_Indices_Comercio_Externo.pdf" download>Descarregar <Icon name="download"/></a></div></article>
        <article className="annex-index"><span className="doc-type">CONTEÚDO DOS ANEXOS</span><h3>Documentação de suporte à decisão</h3><ul><li>Fundamentação económica e institucional</li><li>Fontes e estrutura dos dados</li><li>Metodologia de cálculo do IVU</li><li>Laspeyres, Paasche e Fisher</li><li>Critérios de qualidade e outliers</li><li>Resultados 2022–2025</li><li>Fluxo operacional e sintaxes SPSS</li><li>Roteiro de validação e publicação</li></ul><p className="annex-note">Resultados preliminares — não constituem ainda estatística oficial.</p></article>
      </div>
    </section>

    <section className="decision"><div><div className="kicker light">PRÓXIMA DECISÃO</div><h2>Da metodologia à estatística oficial</h2><p>Aprovar Fisher como referência, validar equivalências de unidades, fixar o cabaz e os pesos de 2022, recalcular as periodicidades e produzir o boletim piloto.</p></div><div className="roadmap">{["Consolidar","Reprocessar","Validar","Publicar"].map((x,i)=><span key={x}><b>{i+1}</b>{x}</span>)}</div></section>

    <footer><div className="brand inverse"><span className="emblem">M</span><span>REPÚBLICA DE MOÇAMBIQUE<small>MINISTÉRIO DA ECONOMIA · DNCE</small></span></div><p>Portal dos Índices do Comércio Externo<br/>Praça 25 de Junho, Maputo · Moçambique</p><p className="footer-note">Resultados preliminares. A divulgação oficial depende de validação técnica e aprovação institucional.</p></footer>
  </main>
}

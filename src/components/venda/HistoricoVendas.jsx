import { useState } from "react";
import { fmt, fmtDate, fmtTime, PAGAMENTOS } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function HistoricoVendas({vendas,produtos,clientes,onBack,setModal}){
  const [filtro,setFiltro]=useState("hoje");
  const hoje=new Date();
  const filtradas=vendas.filter(v=>{
    const d=new Date(v.data);
    if(filtro==="hoje")return d.toDateString()===hoje.toDateString();
    if(filtro==="mes")return d.getMonth()===hoje.getMonth()&&d.getFullYear()===hoje.getFullYear();
    return true;
  });
  const totalFiltro=filtradas.reduce((s,v)=>s+Number(v.total),0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{color:"#8b6914"}}><Icon name="back" size={20}/></button>
        <div className="section-title">Histórico</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        {[["hoje","Hoje"],["mes","Este mês"],["todos","Tudo"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFiltro(id)} style={{flex:1,padding:"7px 4px",borderRadius:10,fontWeight:600,fontSize:12,background:filtro===id?"#8b6914":"#f0ebe0",color:filtro===id?"#fff":"#5a4a1e",transition:".15s"}}>{label}</button>
        ))}
      </div>
      <div className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:11,color:"#8b7a50",fontWeight:600,textTransform:"uppercase"}}>{filtradas.length} venda{filtradas.length!==1?"s":""}</div>
          <div style={{fontSize:24,fontWeight:800,color:"#2a1f06"}}>{fmt(totalFiltro)}</div>
        </div>
        <div style={{fontSize:32}}>📊</div>
      </div>
      {filtradas.length===0&&<div style={{textAlign:"center",padding:40,color:"#8b7a50"}}>Nenhuma venda no período</div>}
      {filtradas.map(v=>{
        const pag=PAGAMENTOS.find(p=>p.id===v.pagamento);
        const c=clientes.find(c=>c.id===v.cliente_id);
        return(
          <div key={v.id} className="card" style={{cursor:"pointer"}} onClick={()=>setModal({type:"recibo",data:v})}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:"#2a1f06"}}>{fmt(v.total)}</div>
                <div style={{fontSize:12,color:"#8b7a50",marginTop:2}}>{fmtDate(v.data)} às {fmtTime(v.data)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <span className={v.pagamento==="notinha"?"badge-alert":"badge-ok"}>{pag?.emoji} {pag?.label}</span>
                {c&&<div style={{fontSize:11,color:"#8b7a50",marginTop:3}}>{c.nome}</div>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

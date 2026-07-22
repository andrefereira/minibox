import { useState } from "react";
import { fmt } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function Estoque({produtos,sb,showToast,setModal,onReload}){
  const [busca,setBusca]=useState("");
  const [catFiltro,setCatFiltro]=useState("Todas");
  const cats=["Todas",...new Set(produtos.map(p=>p.categoria).filter(Boolean))];
  const filtrados=produtos.filter(p=>(catFiltro==="Todas"||p.categoria===catFiltro)&&p.nome.toLowerCase().includes(busca.toLowerCase()));
  const deletar=async id=>{
    if(!confirm("Remover produto?"))return;
    await sb.from("produtos").delete().eq("id",id);
    onReload();
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="section-title">Estoque</div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setModal({type:"entrada-estoque"})}>+ Entrada</button>
          <button className="btn-primary" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setModal({type:"novo-produto"})}>+ Produto</button>
        </div>
      </div>
      <input className="input" placeholder="🔍 Buscar produto..." value={busca} onChange={e=>setBusca(e.target.value)}/>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {cats.map(c=><button key={c} onClick={()=>setCatFiltro(c)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,background:catFiltro===c?"#8b6914":"#f0ebe0",color:catFiltro===c?"#fff":"#5a4a1e",transition:".15s"}}>{c}</button>)}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtrados.map(p=>(
          <div key={p.id} className="card" style={{border:Number(p.estoque)<=Number(p.minimo)?"1.5px solid #ffccbc":"1.5px solid transparent"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:700,color:"#2a1f06"}}>{p.nome}</div>
                <div style={{fontSize:12,color:"#8b7a50",marginTop:2}}>{p.categoria} · {fmt(p.preco)}/{p.unidade}</div>
                {p.codigo_barras&&<div style={{fontSize:10,color:"#b0a080",marginTop:2}}>📦 {p.codigo_barras}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <span className={Number(p.estoque)<=Number(p.minimo)?"badge-alert":"badge-ok"}>{p.estoque} {p.unidade}</span>
                {Number(p.estoque)<=Number(p.minimo)&&<div style={{fontSize:10,color:"#e65100",marginTop:2}}>⚠ Repor</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              <button className="btn-ghost" style={{fontSize:12,padding:"5px 10px",flex:1}} onClick={()=>setModal({type:"novo-produto",data:p})}>Editar</button>
              <button className="btn-danger" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>deletar(p.id)}><Icon name="trash" size={12}/></button>
            </div>
          </div>
        ))}
        {filtrados.length===0&&<div style={{textAlign:"center",color:"#8b7a50",padding:32}}>Nenhum produto encontrado</div>}
      </div>
    </div>
  );
}

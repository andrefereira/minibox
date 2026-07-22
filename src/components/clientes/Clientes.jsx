import { useState } from "react";
import { fmt } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function Clientes({clientes,movimentos,sb,showToast,setModal,onReload}){
  const [busca,setBusca]=useState("");
  const filtrados=clientes.filter(c=>c.nome.toLowerCase().includes(busca.toLowerCase()));
  const divida=id=>movimentos.filter(m=>m.cliente_id===id&&!m.pago).reduce((s,m)=>s+Number(m.valor),0);
  const gasto=id=>movimentos.filter(m=>m.cliente_id===id).reduce((s,m)=>s+Number(m.valor),0);
  const deletar=async id=>{
    if(!confirm("Remover cliente?"))return;
    await sb.from("clientes").delete().eq("id",id);
    onReload();
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="section-title">Clientes</div>
        <button className="btn-primary" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setModal({type:"novo-cliente"})}>+ Cliente</button>
      </div>
      <input className="input" placeholder="🔍 Buscar cliente..." value={busca} onChange={e=>setBusca(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {filtrados.map(c=>{
          const d=divida(c.id),g=gasto(c.id);
          return(
            <div key={c.id} className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:15,color:"#2a1f06"}}>{c.nome}</div>
                  <div style={{fontSize:12,color:"#8b7a50",marginTop:2}}>{c.telefone}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  {d>0?<span className="badge-alert">{fmt(d)} devendo</span>:<span className="badge-ok">Em dia ✓</span>}
                  <div style={{fontSize:11,color:"#8b7a50",marginTop:4}}>Limite: {fmt(c.limite)}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:8,padding:"8px 0",borderTop:"1px solid #f0ebe0"}}>
                {[["Total comprado",fmt(g),"#3a2c0e"],["Em aberto",fmt(d),d>0?"#e65100":"#2e7d32"],["Crédito disp.",fmt(Number(c.limite)-d),"#1565c0"]].map(([label,val,color])=>(
                  <div key={label} style={{flex:1,textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color}}>{val}</div>
                    <div style={{fontSize:10,color:"#8b7a50"}}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:6,marginTop:8}}>
                <button className="btn-ghost" style={{flex:1,fontSize:12,padding:"5px"}} onClick={()=>setModal({type:"novo-cliente",data:c})}>Editar</button>
                <button className="btn-danger" style={{fontSize:12,padding:"5px 10px"}} onClick={()=>deletar(c.id)}><Icon name="trash" size={12}/></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

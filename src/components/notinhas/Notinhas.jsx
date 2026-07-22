import { useState } from "react";
import { fmt, fmtDate } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function Notinhas({movimentos,clientes,produtos,sb,showToast,setModal,onReload}){
  const [clienteSel,setClienteSel]=useState("todos");
  const porCliente=clientes.map(c=>{
    const movs=movimentos.filter(m=>m.cliente_id===c.id&&!m.pago);
    return{...c,movs,divida:movs.reduce((s,m)=>s+Number(m.valor),0)};
  }).filter(c=>c.divida>0);
  const filtrados=clienteSel==="todos"?porCliente:porCliente.filter(c=>c.id===parseInt(clienteSel));
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="section-title">Notinhas</div>
        <button className="btn-primary" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setModal({type:"nova-notinha"})}>+ Lançar</button>
      </div>
      <select className="input" value={clienteSel} onChange={e=>setClienteSel(e.target.value)}>
        <option value="todos">Todos os clientes</option>
        {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      {filtrados.length===0&&(
        <div className="card" style={{textAlign:"center",padding:40,color:"#8b7a50"}}>
          <div style={{fontSize:40,marginBottom:8}}>✨</div>
          <div style={{fontWeight:600}}>Nenhuma notinha em aberto</div>
        </div>
      )}
      {filtrados.map(c=>(
        <div key={c.id} className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:"#2a1f06"}}>{c.nome}</div>
              <div style={{fontSize:12,color:"#8b7a50"}}>{c.telefone}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,color:"#e65100",fontSize:18}}>{fmt(c.divida)}</div>
              <div style={{fontSize:11,color:"#8b7a50"}}>em aberto</div>
            </div>
          </div>
          <div style={{background:"#faf7f2",borderRadius:10,padding:"8px 10px",marginBottom:10}}>
            {c.movs.map(m=>{
              const prod=produtos.find(p=>p.id===m.produto_id);
              return(
                <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #ede8de",fontSize:13}}>
                  <span style={{fontWeight:500,color:"#3a2c0e"}}>{prod?.nome||"Produto"} <span style={{color:"#8b7a50"}}>x{m.qtd}</span></span>
                  <div style={{display:"flex",gap:8}}>
                    <span style={{fontWeight:600}}>{fmt(m.valor)}</span>
                    <span style={{color:"#8b7a50",fontSize:11}}>{fmtDate(m.data)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn-primary" style={{width:"100%"}} onClick={()=>setModal({type:"pagar-notinha",data:c})}>
            <Icon name="check" size={14}/> Registrar Pagamento
          </button>
        </div>
      ))}
    </div>
  );
}

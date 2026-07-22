import { useState } from "react";
import { fmt } from "../../lib/format.js";

export default function ModalPagar({data,onClose,movimentos,sb,onSave}){
  const [tipo,setTipo]=useState("total");
  const [valor,setValor]=useState(data.divida.toFixed(2));
  const [salvando,setSalvando]=useState(false);
  const salvar=async()=>{
    const pagar=parseFloat(valor);
    if(!pagar||pagar<=0)return alert("Informe o valor");
    setSalvando(true);
    let restante=pagar;
    for(const m of movimentos.filter(m=>m.cliente_id===data.id&&!m.pago)){
      if(restante<=0)break;
      if(restante>=Number(m.valor)){
        await sb.from("movimentos").update({pago:true}).eq("id",m.id);
        restante-=Number(m.valor);
      } else {
        await sb.from("movimentos").update({valor:Number(m.valor)-restante}).eq("id",m.id);
        restante=0;
      }
    }
    setSalvando(false);onSave();
  };
  return(
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#2a1f06",marginBottom:4}}>Registrar Pagamento</div>
      <div style={{fontSize:14,color:"#8b7a50",marginBottom:16}}>{data.nome}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"#faf7f2",borderRadius:12,padding:16,textAlign:"center"}}>
          <div style={{fontSize:12,color:"#8b7a50",fontWeight:600,textTransform:"uppercase"}}>Total em aberto</div>
          <div style={{fontSize:32,fontWeight:800,color:"#e65100",marginTop:4}}>{fmt(data.divida)}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {["total","parcial"].map(t=>(
            <button key={t} onClick={()=>{setTipo(t);if(t==="total")setValor(data.divida.toFixed(2));}}
              style={{flex:1,padding:10,borderRadius:10,fontWeight:600,fontSize:13,background:tipo===t?"#8b6914":"#f0ebe0",color:tipo===t?"#fff":"#5a4a1e",transition:".15s"}}>
              {t==="total"?"Total":"Parcial"}
            </button>
          ))}
        </div>
        {tipo==="parcial"&&<div><label className="label">Valor pago (R$)</label><input className="input" type="number" step="0.01" value={valor} onChange={e=>setValor(e.target.value)}/></div>}
        <div style={{display:"flex",gap:10,marginTop:4}}>
          <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{flex:2,opacity:salvando?.6:1}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Confirmar "+fmt(parseFloat(valor)||0)}</button>
        </div>
      </div>
    </>
  );
}

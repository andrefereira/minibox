import { useState } from "react";

export default function ModalEntrada({data,onClose,produtos,sb,onSave}){
  const [prodId,setProdId]=useState(data?.id||produtos[0]?.id||"");
  const [qtd,setQtd]=useState("");
  const [salvando,setSalvando]=useState(false);
  const prod=produtos.find(p=>p.id===parseInt(prodId)||p.id===prodId);
  const salvar=async()=>{
    if(!qtd||parseFloat(qtd)<=0)return alert("Informe a quantidade");
    setSalvando(true);
    await sb.from("produtos").update({estoque:Number(prod.estoque)+parseFloat(qtd)}).eq("id",prod.id);
    setSalvando(false);onSave();
  };
  return(
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#2a1f06",marginBottom:20}}>Entrada de Estoque</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><label className="label">Produto</label>
          <select className="input" value={prodId} onChange={e=>setProdId(e.target.value)}>
            {produtos.map(p=><option key={p.id} value={p.id}>{p.nome} (atual: {p.estoque} {p.unidade})</option>)}
          </select>
        </div>
        {prod&&<div style={{background:"#faf7f2",borderRadius:10,padding:12,fontSize:13,color:"#5a4a1e"}}>Estoque atual: <strong>{prod.estoque} {prod.unidade}</strong></div>}
        <div><label className="label">Quantidade a adicionar</label><input className="input" type="number" step="0.1" value={qtd} onChange={e=>setQtd(e.target.value)}/></div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{flex:2,opacity:salvando?.6:1}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Confirmar entrada"}</button>
        </div>
      </div>
    </>
  );
}

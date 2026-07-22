import { useState } from "react";
import { fmt, now } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function ModalNotinha({onClose,clientes,produtos,movimentos,sb,onSave}){
  const [clienteId,setClienteId]=useState(clientes[0]?.id||"");
  const [itens,setItens]=useState([{produtoId:produtos[0]?.id||"",qtd:1}]);
  const [salvando,setSalvando]=useState(false);
  const addItem=()=>setItens(i=>[...i,{produtoId:produtos[0]?.id||"",qtd:1}]);
  const setItem=(idx,k,v)=>setItens(i=>i.map((it,j)=>j===idx?{...it,[k]:v}:it));
  const remItem=idx=>setItens(i=>i.filter((_,j)=>j!==idx));
  const total=itens.reduce((s,it)=>{const p=produtos.find(p=>p.id===parseInt(it.produtoId)||p.id===it.produtoId);return s+(p?Number(p.preco)*parseFloat(it.qtd||0):0);},0);
  const cliente=clientes.find(c=>c.id===parseInt(clienteId)||c.id===clienteId);
  const dividaAtual=cliente?movimentos.filter(m=>m.cliente_id===cliente.id&&!m.pago).reduce((s,m)=>s+Number(m.valor),0):0;
  const limiteDisp=cliente?Number(cliente.limite)-dividaAtual:0;
  const salvar=async()=>{
    if(!clienteId)return alert("Selecione o cliente");
    if(total>limiteDisp)return alert(`Limite insuficiente! Disponível: ${fmt(limiteDisp)}`);
    setSalvando(true);
    const movs=itens.map(it=>{
      const p=produtos.find(p=>p.id===parseInt(it.produtoId)||p.id===it.produtoId);
      return{tipo:"notinha",cliente_id:parseInt(clienteId),produto_id:p.id,qtd:parseFloat(it.qtd),valor:Number(p.preco)*parseFloat(it.qtd),data:now(),pago:false};
    });
    await sb.from("movimentos").insert(movs);
    for(const it of itens){
      const p=produtos.find(p=>p.id===parseInt(it.produtoId)||p.id===it.produtoId);
      await sb.from("produtos").update({estoque:Math.max(0,Number(p.estoque)-parseFloat(it.qtd))}).eq("id",p.id);
    }
    setSalvando(false);onSave();
  };
  return(
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#2a1f06",marginBottom:20}}>Lançar na Notinha</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><label className="label">Cliente</label><select className="input" value={clienteId} onChange={e=>setClienteId(e.target.value)}>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
        {cliente&&<div style={{background:"#faf7f2",borderRadius:10,padding:10,display:"flex",justifyContent:"space-between",fontSize:13}}><span style={{color:"#8b7a50"}}>Crédito disponível:</span><strong style={{color:limiteDisp<total?"#c62828":"#2e7d32"}}>{fmt(limiteDisp)}</strong></div>}
        <div>
          <label className="label">Itens</label>
          {itens.map((it,idx)=>(
            <div key={idx} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
              <select className="input" style={{flex:3}} value={it.produtoId} onChange={e=>setItem(idx,"produtoId",e.target.value)}>{produtos.map(p=><option key={p.id} value={p.id}>{p.nome}</option>)}</select>
              <input className="input" type="number" style={{flex:1}} value={it.qtd} onChange={e=>setItem(idx,"qtd",e.target.value)} min="0.1" step="0.1"/>
              {itens.length>1&&<button onClick={()=>remItem(idx)} style={{color:"#c62828"}}><Icon name="x" size={16}/></button>}
            </div>
          ))}
          <button className="btn-ghost" style={{width:"100%",fontSize:13}} onClick={addItem}>+ Adicionar item</button>
        </div>
        <div style={{background:"#3a2c0e",borderRadius:12,padding:"12px 16px",display:"flex",justifyContent:"space-between"}}>
          <span style={{color:"#c4a85a",fontWeight:600}}>Total</span>
          <span style={{color:"#f5d78a",fontWeight:800,fontSize:20}}>{fmt(total)}</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{flex:2,opacity:salvando?.6:1}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Lançar"}</button>
        </div>
      </div>
    </>
  );
}

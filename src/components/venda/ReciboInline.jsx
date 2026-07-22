import { useState, useRef } from "react";
import { fmt, fmtDate, fmtTime, PAGAMENTOS, compartilhar } from "../../lib/format.js";
import Icon from "../Icon.jsx";

export default function ReciboInline({venda,produtos,clientes,onNova,onHistorico}){
  const cliente=clientes.find(c=>c.id===venda.cliente_id);
  const pag=PAGAMENTOS.find(p=>p.id===venda.pagamento);
  const reciboRef=useRef(null);
  const [sharing,setSharing]=useState(false);
  const [shareResult,setShareResult]=useState(null);
  const handleShare=async()=>{
    if(!reciboRef.current)return;setSharing(true);
    try{const r=await compartilhar(reciboRef.current,`recibo-${venda.id}.png`);if(r==="downloaded")setShareResult("downloaded");}
    catch{setShareResult("error");}
    finally{setSharing(false);setTimeout(()=>setShareResult(null),3000);}
  };
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{textAlign:"center",padding:"20px 0 8px"}}>
        <div style={{fontSize:48}}>✅</div>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,color:"#2e7d32",marginTop:6}}>Venda Finalizada!</div>
        <div style={{fontSize:13,color:"#8b7a50",marginTop:4}}>{fmtDate(venda.data)} às {fmtTime(venda.data)}</div>
      </div>
      <div ref={reciboRef} style={{background:"#faf7f2",borderRadius:16,padding:20,border:"1.5px dashed #d4b97a"}}>
        <div style={{textAlign:"center",marginBottom:14,paddingBottom:12,borderBottom:"1px dashed #d4b97a"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,color:"#3a2c0e",fontWeight:700}}>🏪 Mini Box Andrérika</div>
          <div style={{fontSize:12,color:"#8b7a50",marginTop:4}}>Recibo · {fmtDate(venda.data)} {fmtTime(venda.data)}</div>
        </div>
        {(venda.itens||[]).map((it,i)=>{
          const p=produtos.find(p=>p.id===it.produtoId);
          return(
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:14,borderBottom:"1px solid #ede8de"}}>
              <span style={{color:"#3a2c0e"}}>{p?.nome} <span style={{color:"#8b7a50",fontSize:12}}>x{it.qtd}</span></span>
              <span style={{fontWeight:600,color:"#2a1f06"}}>{fmt(p?Number(p.preco)*it.qtd:0)}</span>
            </div>
          );
        })}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:10,borderTop:"2px dashed #d4b97a"}}>
          <span style={{fontWeight:700,fontSize:16,color:"#3a2c0e"}}>Total</span>
          <span style={{fontWeight:800,fontSize:22,color:"#2a1f06"}}>{fmt(venda.total)}</span>
        </div>
        <div style={{marginTop:10,padding:"8px 12px",background:"#fff",borderRadius:8,fontSize:13,display:"flex",justifyContent:"space-between",border:"1px solid #ede8de"}}>
          <span style={{color:"#8b7a50"}}>{pag?.emoji} {pag?.label}{cliente?` · ${cliente.nome}`:""}</span>
          {Number(venda.troco)>0&&<span style={{color:"#2e7d32",fontWeight:600}}>Troco: {fmt(venda.troco)}</span>}
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"#b0a080"}}>Obrigado pela preferência! 🙏</div>
      </div>
      <button onClick={handleShare} disabled={sharing}
        style={{width:"100%",padding:"13px 20px",borderRadius:12,background:sharing?"#ccc":"#25D366",color:"#fff",fontWeight:700,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:10,border:"none",cursor:sharing?"wait":"pointer"}}>
        {sharing?"⏳ Gerando imagem...":shareResult==="downloaded"?"✅ Imagem salva! Abra o WhatsApp":shareResult==="error"?"❌ Tente novamente":"📲 Compartilhar pelo WhatsApp"}
      </button>
      <div style={{display:"flex",gap:10}}>
        <button className="btn-ghost" style={{flex:1}} onClick={onHistorico}><Icon name="eye" size={14}/> Histórico</button>
        <button className="btn-green" style={{flex:2}} onClick={onNova}><Icon name="plus" size={14}/> Nova Venda</button>
      </div>
    </div>
  );
}

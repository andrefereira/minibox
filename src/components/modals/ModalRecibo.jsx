import { useState, useRef } from "react";
import { fmt, fmtDate, fmtTime, PAGAMENTOS, compartilhar } from "../../lib/format.js";

export default function ModalRecibo({venda,produtos,clientes,onClose}){
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
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#2a1f06",marginBottom:4}}>Recibo</div>
      <div style={{fontSize:12,color:"#8b7a50",marginBottom:14}}>{fmtDate(venda.data)} às {fmtTime(venda.data)}</div>
      <div ref={reciboRef} style={{background:"#faf7f2",borderRadius:12,padding:16,border:"1px dashed #d4b97a",marginBottom:14}}>
        <div style={{textAlign:"center",marginBottom:12,paddingBottom:10,borderBottom:"1px dashed #d4b97a"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,color:"#3a2c0e",fontWeight:700}}>🏪 Mini Box Andrérika</div>
          <div style={{fontSize:11,color:"#8b7a50",marginTop:3}}>Recibo · {fmtDate(venda.data)} {fmtTime(venda.data)}</div>
        </div>
        {(venda.itens||[]).map((it,i)=>{
          const p=produtos.find(p=>p.id===it.produtoId);
          return(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",fontSize:13,borderBottom:"1px solid #ede8de"}}>
            <span style={{color:"#3a2c0e"}}>{p?.nome} <span style={{color:"#8b7a50"}}>x{it.qtd}</span></span>
            <span style={{fontWeight:600}}>{fmt(p?Number(p.preco)*it.qtd:0)}</span>
          </div>);
        })}
        <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 6px",borderTop:"2px dashed #d4b97a",marginTop:4}}>
          <span style={{fontWeight:700,fontSize:15}}>Total</span>
          <span style={{fontWeight:800,fontSize:20,color:"#2a1f06"}}>{fmt(venda.total)}</span>
        </div>
        <div style={{background:"#fff",borderRadius:8,padding:"8px 10px",fontSize:13,display:"flex",justifyContent:"space-between",border:"1px solid #ede8de"}}>
          <span style={{color:"#8b7a50"}}>{pag?.emoji} {pag?.label}{cliente?` · ${cliente.nome}`:""}</span>
          {Number(venda.troco)>0&&<span style={{color:"#2e7d32",fontWeight:600}}>Troco: {fmt(venda.troco)}</span>}
        </div>
        {venda.assinatura&&(
          <div style={{marginTop:10}}>
            <div style={{fontSize:11,color:"#8b7a50",marginBottom:4}}>Assinatura do cliente</div>
            <img src={venda.assinatura} alt="Assinatura" style={{width:"100%",maxHeight:110,objectFit:"contain",background:"#fff",border:"1px solid #ede8de",borderRadius:8}}/>
          </div>
        )}
        <div style={{textAlign:"center",marginTop:12,fontSize:11,color:"#b0a080"}}>Obrigado pela preferência! 🙏</div>
      </div>
      <button onClick={handleShare} disabled={sharing}
        style={{width:"100%",padding:13,borderRadius:12,background:sharing?"#aaa":"#25D366",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"none",cursor:sharing?"wait":"pointer",marginBottom:10}}>
        {sharing?"⏳ Gerando...":shareResult==="downloaded"?"✅ Imagem salva!":shareResult==="error"?"❌ Tente novamente":"📲 Compartilhar pelo WhatsApp"}
      </button>
      <button className="btn-ghost" style={{width:"100%"}} onClick={onClose}>Fechar</button>
    </>
  );
}

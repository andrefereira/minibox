import { useState, useEffect, useRef } from "react";
import { fmt } from "../../lib/format.js";
import { identificarProdutosPorVoz } from "../../lib/ai.js";
import Icon from "../Icon.jsx";

const SpeechRecognitionCtor =
  typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function VoiceOrder({produtos,onConfirm,onClose}){
  const [status,setStatus]=useState("listening"); // listening | idle | processing | results | error | unsupported
  const [transcript,setTranscript]=useState("");
  const [itens,setItens]=useState([]); // [{produtoId,qtd,selecionado}]
  const [erro,setErro]=useState("");
  const recognitionRef=useRef(null);
  const transcriptRef=useRef("");

  const iniciar=()=>{
    if(!SpeechRecognitionCtor){ setStatus("unsupported"); return; }
    setTranscript("");transcriptRef.current="";setErro("");setStatus("listening");
    const rec=new SpeechRecognitionCtor();
    rec.lang="pt-BR";
    rec.continuous=true;
    rec.interimResults=true;
    recognitionRef.current=rec;

    rec.onresult=(e)=>{
      let texto="";
      for(let i=0;i<e.results.length;i++) texto+=e.results[i][0].transcript+" ";
      texto=texto.trim();
      transcriptRef.current=texto;
      setTranscript(texto);
    };
    rec.onerror=(e)=>{
      if(e.error==="no-speech") return; // silêncio momentâneo: deixa continuar ouvindo
      setStatus("error");
      setErro(e.error==="not-allowed"?"Permissão de microfone negada.":"Erro ao capturar áudio. Tente de novo.");
    };
    rec.onend=()=>{
      setStatus(prev=>prev==="listening"?"idle":prev);
    };
    rec.start();
  };

  useEffect(()=>{
    iniciar();
    return ()=>{ try{recognitionRef.current?.stop();}catch{} };
  },[]);

  const pararEEnviar=async()=>{
    try{recognitionRef.current?.stop();}catch{}
    const texto=transcriptRef.current.trim();
    if(!texto){ setStatus("error"); setErro("Não entendi nada. Tente de novo."); return; }
    setStatus("processing");
    try{
      const resultado=await identificarProdutosPorVoz(texto,produtos);
      if(resultado.length===0){
        setStatus("error");
        setErro("Não identifiquei nenhum produto conhecido nessa descrição.");
        return;
      }
      setItens(resultado.map(it=>({produtoId:it.produto_id,qtd:it.quantidade,selecionado:true})));
      setStatus("results");
    }catch(e){
      setStatus("error");
      setErro("Erro ao identificar produtos. Verifique a conexão.");
    }
  };

  const toggleItem=(idx)=>setItens(its=>its.map((it,i)=>i===idx?{...it,selecionado:!it.selecionado}:it));
  const setQtdItem=(idx,delta)=>setItens(its=>its.map((it,i)=>i===idx?{...it,qtd:Math.max(0.5,+(it.qtd+delta).toFixed(1))}:it));

  const confirmar=()=>{
    const selecionados=itens.filter(it=>it.selecionado).map(({produtoId,qtd})=>({produtoId,qtd}));
    onConfirm(selecionados);
  };

  const totalSelecionado=itens.filter(it=>it.selecionado).reduce((s,it)=>{
    const p=produtos.find(p=>p.id===it.produtoId);
    return s+(p?Number(p.preco)*it.qtd:0);
  },0);

  return(
    <div className="scan-overlay" style={{background:"#3a2c0e"}}>
      <div style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{color:"#fff",fontWeight:600,fontSize:15}}>🎙️ Pedido por voz</span>
        <button onClick={onClose} style={{color:"#fff",background:"rgba(255,255,255,.15)",borderRadius:20,padding:"6px 12px",fontSize:13}}>Fechar ✕</button>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>

        {status==="unsupported"&&(
          <div style={{margin:"auto",textAlign:"center",color:"#f5d78a",padding:24}}>
            <div style={{fontSize:40,marginBottom:12}}>🚫</div>
            <div style={{fontWeight:600,marginBottom:6}}>Reconhecimento de voz não disponível</div>
            <div style={{fontSize:13,color:"#c4a85a"}}>Tente pelo Chrome no Android ou no computador.</div>
          </div>
        )}

        {(status==="listening"||status==="idle")&&(
          <div style={{margin:"auto",textAlign:"center",maxWidth:340}}>
            <div style={{
              width:88,height:88,borderRadius:"50%",margin:"0 auto 20px",
              background:status==="listening"?"#c62828":"rgba(255,255,255,.12)",
              display:"flex",alignItems:"center",justifyContent:"center",
              animation:status==="listening"?"pulseMic 1.4s ease infinite":"none",
            }}>
              <Icon name="mic" size={36}/>
              <style>{`@keyframes pulseMic{0%,100%{box-shadow:0 0 0 0 rgba(198,40,40,.5)}50%{box-shadow:0 0 0 16px rgba(198,40,40,0)}}`}</style>
            </div>
            <div style={{color:"#c4a85a",fontSize:13,marginBottom:14}}>
              {status==="listening"?"Ouvindo... descreva o pedido":"Toque para falar de novo"}
            </div>
            <div style={{color:"#fff",fontSize:16,minHeight:44,marginBottom:20}}>{transcript||" "}</div>
            {status==="listening"?(
              <button className="btn-primary" style={{width:"100%",padding:14,fontSize:15}} onClick={pararEEnviar}>
                <Icon name="check" size={16}/> Concluir e identificar
              </button>
            ):(
              <button className="btn-primary" style={{width:"100%",padding:14,fontSize:15}} onClick={iniciar}>
                <Icon name="mic" size={16}/> Falar novamente
              </button>
            )}
          </div>
        )}

        {status==="processing"&&(
          <div style={{margin:"auto",textAlign:"center"}}>
            <div className="spinner" style={{margin:"0 auto 16px",borderColor:"rgba(255,255,255,.2)",borderTopColor:"#f5d78a"}}/>
            <div style={{color:"#c4a85a",fontSize:14}}>Identificando produtos com IA...</div>
            <div style={{color:"#8b7a50",fontSize:12,marginTop:6}}>"{transcript}"</div>
          </div>
        )}

        {status==="error"&&(
          <div style={{margin:"auto",textAlign:"center",maxWidth:320}}>
            <div style={{fontSize:36,marginBottom:12}}>😕</div>
            <div style={{color:"#f5d78a",fontWeight:600,marginBottom:16}}>{erro}</div>
            <button className="btn-primary" style={{width:"100%",padding:12}} onClick={iniciar}>Tentar novamente</button>
          </div>
        )}

        {status==="results"&&(
          <div>
            <div style={{color:"#c4a85a",fontSize:12,marginBottom:4}}>Você disse:</div>
            <div style={{color:"#fff",fontSize:14,marginBottom:16,fontStyle:"italic"}}>"{transcript}"</div>
            <div style={{background:"#faf7f2",borderRadius:14,padding:12}}>
              {itens.map((it,idx)=>{
                const p=produtos.find(p=>p.id===it.produtoId);
                if(!p)return null;
                return(
                  <div key={idx} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 4px",borderBottom:idx<itens.length-1?"1px solid #f0ebe0":"none",opacity:it.selecionado?1:.4}}>
                    <button onClick={()=>toggleItem(idx)} style={{width:22,height:22,borderRadius:6,border:"2px solid #8b6914",background:it.selecionado?"#8b6914":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {it.selecionado&&<Icon name="check" size={12}/>}
                    </button>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:"#2a1f06"}}>{p.nome}</div>
                      <div style={{fontSize:11,color:"#8b7a50"}}>{fmt(p.preco)}/{p.unidade}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <button className="qty-btn" onClick={()=>setQtdItem(idx,-0.5)}>−</button>
                      <span style={{fontWeight:700,minWidth:26,textAlign:"center",fontSize:14}}>{it.qtd}</span>
                      <button className="qty-btn" onClick={()=>setQtdItem(idx,0.5)}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",color:"#f5d78a",padding:"14px 4px",fontWeight:700}}>
              <span>Total selecionado</span><span>{fmt(totalSelecionado)}</span>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" style={{flex:1}} onClick={iniciar}>Falar de novo</button>
              <button className="btn-primary" style={{flex:2}} disabled={totalSelecionado<=0} onClick={confirmar}>
                <Icon name="check" size={16}/> Adicionar ao carrinho
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

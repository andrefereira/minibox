import { useState, useRef, useEffect } from "react";
import { fmt, now, PAGAMENTOS } from "../../lib/format.js";
import Icon from "../Icon.jsx";
import BarcodeScanner from "../BarcodeScanner.jsx";
import ReciboInline from "./ReciboInline.jsx";
import HistoricoVendas from "./HistoricoVendas.jsx";

const SpeechRecognitionCtor =
  typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

export default function Venda({produtos,clientes,movimentos,vendas,sb,showToast,setModal,onReload}){
  const [itens,setItens]=useState([]);
  const [pagamento,setPagamento]=useState("dinheiro");
  const [clienteId,setClienteId]=useState("");
  const [troco,setTroco]=useState("");
  const [busca,setBusca]=useState("");
  const [view,setView]=useState("pdv");
  const [reciboAtual,setReciboAtual]=useState(null);
  const [salvando,setSalvando]=useState(false);
  const [scanning,setScanning]=useState(false);
  const [listening,setListening]=useState(false);
  const recognitionRef=useRef(null);

  useEffect(()=>()=>{ try{recognitionRef.current?.stop();}catch{} },[]);

  const toggleDitado=()=>{
    if(listening){ recognitionRef.current?.stop(); return; }
    if(!SpeechRecognitionCtor){ showToast("Reconhecimento de voz não suportado neste navegador","err"); return; }
    const rec=new SpeechRecognitionCtor();
    rec.lang="pt-BR";
    rec.continuous=true;
    rec.interimResults=true;
    recognitionRef.current=rec;
    rec.onresult=(e)=>{
      let texto="";
      for(let i=0;i<e.results.length;i++) texto+=e.results[i][0].transcript+" ";
      setBusca(texto.trim());
    };
    rec.onerror=(e)=>{
      if(e.error==="no-speech") return;
      setListening(false);
      showToast(e.error==="not-allowed"?"Permissão de microfone negada":"Erro ao capturar áudio","err");
    };
    rec.onend=()=>setListening(false);
    rec.start();
    setListening(true);
  };

  const prodsFiltrados=produtos.filter(p=>p.nome.toLowerCase().includes(busca.toLowerCase())&&Number(p.estoque)>0);
  const addItem=prod=>{
    setItens(its=>{
      const ex=its.find(i=>i.produtoId===prod.id);
      if(ex)return its.map(i=>i.produtoId===prod.id?{...i,qtd:i.qtd+1}:i);
      return[...its,{produtoId:prod.id,qtd:1}];
    });
    setBusca("");
  };

  const handleScan=(codigo)=>{
    setScanning(false);
    const prod=produtos.find(p=>p.codigo_barras===codigo);
    if(prod){
      if(Number(prod.estoque)<=0){ showToast(`${prod.nome} sem estoque!`,"err"); return; }
      addItem(prod);
      showToast(`✓ ${prod.nome} adicionado`);
    } else {
      showToast(`Código ${codigo} não cadastrado`,"err");
    }
  };

  const setQtd=(prodId,delta)=>setItens(its=>its.map(i=>i.produtoId===prodId?{...i,qtd:Math.max(0.1,+(i.qtd+delta).toFixed(1))}:i).filter(i=>i.qtd>0));
  const removeItem=prodId=>setItens(its=>its.filter(i=>i.produtoId!==prodId));
  const total=itens.reduce((s,it)=>{const p=produtos.find(p=>p.id===it.produtoId);return s+(p?Number(p.preco)*it.qtd:0);},0);
  const trocoVal=pagamento==="dinheiro"&&troco?Math.max(0,parseFloat(troco)-total):0;

  const finalizar=async()=>{
    if(itens.length===0){showToast("Adicione produtos","err");return;}
    if(pagamento==="notinha"&&!clienteId){showToast("Selecione o cliente","err");return;}
    if(pagamento==="notinha"){
      const c=clientes.find(c=>c.id===parseInt(clienteId));
      const divida=movimentos.filter(m=>m.cliente_id===c.id&&!m.pago).reduce((s,m)=>s+Number(m.valor),0);
      if(total>(Number(c.limite)-divida)){showToast(`Limite insuficiente! Disponível: ${fmt(Number(c.limite)-divida)}`,"err");return;}
    }
    setSalvando(true);
    try {
      const vendaData = {
        data: now(),
        total,
        pagamento,
        cliente_id: pagamento==="notinha"?parseInt(clienteId):null,
        troco: trocoVal,
        itens: itens.map(it=>({produtoId:it.produtoId,qtd:it.qtd})),
      };
      const {data:novaVenda,error:errV}=await sb.from("vendas").insert(vendaData).select().single();
      if(errV) throw errV;

      for(const it of itens){
        const p=produtos.find(p=>p.id===it.produtoId);
        await sb.from("produtos").update({estoque:Math.max(0,Number(p.estoque)-it.qtd)}).eq("id",p.id);
      }

      if(pagamento==="notinha"){
        const movs=itens.map(it=>{
          const p=produtos.find(p=>p.id===it.produtoId);
          return{tipo:"notinha",cliente_id:parseInt(clienteId),produto_id:it.produtoId,qtd:it.qtd,valor:Number(p.preco)*it.qtd,data:now(),pago:false};
        });
        await sb.from("movimentos").insert(movs);
      }

      await onReload();
      setReciboAtual({...novaVenda, itens: vendaData.itens});
      setItens([]);setPagamento("dinheiro");setClienteId("");setTroco("");
      setView("recibo");showToast("Venda finalizada! ✓");
    } catch(e) {
      showToast("Erro ao salvar venda. Verifique a conexão.","err");
    } finally {
      setSalvando(false);
    }
  };

  if(view==="recibo"&&reciboAtual) return <ReciboInline venda={reciboAtual} produtos={produtos} clientes={clientes} onNova={()=>setView("pdv")} onHistorico={()=>setView("historico")}/>;
  if(view==="historico") return <HistoricoVendas vendas={vendas} produtos={produtos} clientes={clientes} onBack={()=>setView("pdv")} setModal={setModal}/>;

  if(scanning) return <BarcodeScanner onResult={handleScan} onClose={()=>setScanning(false)}/>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="section-title">Nova Venda</div>
        <button className="btn-ghost" style={{fontSize:12,padding:"6px 12px"}} onClick={()=>setView("historico")}><Icon name="eye" size={13}/> Histórico</button>
      </div>
      <div style={{position:"relative"}}>
        <div style={{display:"flex",gap:8}}>
          <input className="input" style={{flex:1}} placeholder={listening?"🎙️ Ouvindo... fale o produto":"🔍 Buscar e adicionar produto..."} value={busca} onChange={e=>setBusca(e.target.value)}/>
          <button onClick={toggleDitado} style={{width:46,background:listening?"#c62828":"#3a2c0e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#f5d78a",flexShrink:0,transition:".15s"}}>
            <Icon name="mic" size={20}/>
          </button>
          <button onClick={()=>setScanning(true)} style={{width:46,background:"#3a2c0e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#f5d78a",flexShrink:0}}>
            <Icon name="scan" size={20}/>
          </button>
        </div>
        {busca&&(
          <div style={{position:"absolute",top:"110%",left:0,right:0,background:"#fff",borderRadius:12,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:10,maxHeight:220,overflowY:"auto",border:"1.5px solid #e8e0d0"}}>
            {prodsFiltrados.length===0&&<div style={{padding:16,color:"#8b7a50",fontSize:13,textAlign:"center"}}>Nenhum produto encontrado</div>}
            {prodsFiltrados.map(p=>(
              <button key={p.id} onClick={()=>addItem(p)} style={{width:"100%",padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #f0ebe0",background:"none",textAlign:"left"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#2a1f06"}}>{p.nome}</div>
                  <div style={{fontSize:11,color:"#8b7a50"}}>{p.estoque} {p.unidade} em estoque</div>
                </div>
                <div style={{fontWeight:700,color:"#8b6914",fontSize:14}}>{fmt(p.preco)}</div>
              </button>
            ))}
          </div>
        )}
      </div>
      {itens.length>0&&(
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,color:"#3a2c0e",marginBottom:10}}>Carrinho</div>
          {itens.map(it=>{
            const p=produtos.find(p=>p.id===it.produtoId);if(!p)return null;
            return(
              <div key={it.produtoId} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:"1px solid #f0ebe0"}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#2a1f06"}}>{p.nome}</div>
                  <div style={{fontSize:12,color:"#8b7a50"}}>{fmt(p.preco)}/{p.unidade}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="qty-btn" onClick={()=>setQtd(it.produtoId,-0.5)}>−</button>
                  <span style={{fontWeight:700,minWidth:28,textAlign:"center",fontSize:15}}>{it.qtd}</span>
                  <button className="qty-btn" onClick={()=>setQtd(it.produtoId,0.5)}>+</button>
                </div>
                <div style={{fontWeight:700,color:"#2a1f06",minWidth:60,textAlign:"right",fontSize:14}}>{fmt(Number(p.preco)*it.qtd)}</div>
                <button onClick={()=>removeItem(it.produtoId)} style={{color:"#c62828",padding:2}}><Icon name="x" size={14}/></button>
              </div>
            );
          })}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,padding:"10px 0 0",borderTop:"2px solid #3a2c0e"}}>
            <span style={{fontWeight:700,color:"#3a2c0e"}}>Total</span>
            <span style={{fontWeight:800,fontSize:20,color:"#3a2c0e"}}>{fmt(total)}</span>
          </div>
        </div>
      )}
      <div className="card">
        <div style={{fontWeight:700,fontSize:13,color:"#3a2c0e",marginBottom:10}}>Forma de pagamento</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {PAGAMENTOS.map(p=>(
            <button key={p.id} className={`pay-btn ${pagamento===p.id?"sel":""}`} onClick={()=>setPagamento(p.id)}>
              <span style={{fontSize:18}}>{p.emoji}</span><span>{p.label}</span>
            </button>
          ))}
        </div>
        {pagamento==="notinha"&&(
          <div style={{marginTop:12}}>
            <label className="label">Cliente</label>
            <select className="input" value={clienteId} onChange={e=>setClienteId(e.target.value)}>
              <option value="">Selecionar cliente...</option>
              {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
        )}
        {pagamento==="dinheiro"&&(
          <div style={{marginTop:12,display:"flex",gap:10,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <label className="label">Valor recebido (R$)</label>
              <input className="input" type="number" step="0.01" placeholder="0,00" value={troco} onChange={e=>setTroco(e.target.value)}/>
            </div>
            {trocoVal>0&&(
              <div style={{background:"#e8f5e9",borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#2e7d32",fontWeight:600}}>TROCO</div>
                <div style={{fontSize:18,fontWeight:800,color:"#2e7d32"}}>{fmt(trocoVal)}</div>
              </div>
            )}
          </div>
        )}
      </div>
      <button className="btn-green" style={{width:"100%",fontSize:16,padding:16,display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:salvando?.6:1}} onClick={finalizar} disabled={salvando}>
        {salvando?"⏳ Salvando...": <><Icon name="check" size={18}/> Finalizar Venda · {fmt(total)}</>}
      </button>
    </div>
  );
}

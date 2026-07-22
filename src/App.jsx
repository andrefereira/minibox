import { useState, useEffect, useCallback } from "react";
import { sb } from "./lib/supabase.js";
import Icon from "./components/Icon.jsx";
import LoginScreen from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Venda from "./components/venda/Venda.jsx";
import Estoque from "./components/estoque/Estoque.jsx";
import Notinhas from "./components/notinhas/Notinhas.jsx";
import Clientes from "./components/clientes/Clientes.jsx";
import ModalProduto from "./components/modals/ModalProduto.jsx";
import ModalNotinha from "./components/modals/ModalNotinha.jsx";
import ModalPagar from "./components/modals/ModalPagar.jsx";
import ModalCliente from "./components/modals/ModalCliente.jsx";
import ModalEntrada from "./components/modals/ModalEntrada.jsx";
import ModalRecibo from "./components/modals/ModalRecibo.jsx";

export default function Root(){
  const [autenticado,setAutenticado]=useState(()=>sessionStorage.getItem("mb_auth")==="1");
  if(!autenticado) return <LoginScreen onLogin={()=>setAutenticado(true)}/>;
  return <App/>;
}

function App(){
  const [tab,setTab]=useState("dashboard");
  const [produtos,setProdutos]=useState([]);
  const [clientes,setClientes]=useState([]);
  const [movimentos,setMovimentos]=useState([]);
  const [vendas,setVendas]=useState([]);
  const [loading,setLoading]=useState(true);
  const [erroConexao,setErroConexao]=useState(false);
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState(null);

  const showToast=(msg,tipo="ok")=>{setToast({msg,tipo});setTimeout(()=>setToast(null),3200);};

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const [rp,rc,rm,rv] = await Promise.all([
        sb.from("produtos").select("*").order("nome"),
        sb.from("clientes").select("*").order("nome"),
        sb.from("movimentos").select("*").order("data",{ascending:false}),
        sb.from("vendas").select("*").order("data",{ascending:false}),
      ]);
      if(rp.error||rc.error) throw new Error("Erro ao carregar");
      setProdutos(rp.data||[]);
      setClientes(rc.data||[]);
      setMovimentos(rm.data||[]);
      setVendas(rv.data||[]);
      setErroConexao(false);
    } catch(e) {
      setErroConexao(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ carregar(); },[carregar]);

  const reloadProdutos = async () => { const {data}=await sb.from("produtos").select("*").order("nome"); if(data) setProdutos(data); };
  const reloadClientes = async () => { const {data}=await sb.from("clientes").select("*").order("nome"); if(data) setClientes(data); };
  const reloadMovimentos = async () => { const {data}=await sb.from("movimentos").select("*").order("data",{ascending:false}); if(data) setMovimentos(data); };
  const reloadVendas = async () => { const {data}=await sb.from("vendas").select("*").order("data",{ascending:false}); if(data) setVendas(data); };

  const alertas=produtos.filter(p=>Number(p.estoque)<=Number(p.minimo));
  const notinhasAbertas=clientes.map(c=>{
    const divida=movimentos.filter(m=>m.cliente_id===c.id&&!m.pago).reduce((s,m)=>s+Number(m.valor),0);
    return{...c,divida};
  }).filter(c=>c.divida>0);
  const totalNotinhas=notinhasAbertas.reduce((s,c)=>s+c.divida,0);
  const hoje=new Date();
  const vendasHoje=vendas.filter(v=>new Date(v.data).toDateString()===hoje.toDateString());
  const totalHoje=vendasHoje.reduce((s,v)=>s+Number(v.total),0);

  if(loading) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#faf7f2",gap:16}}>
      <div className="spinner"/>
      <div style={{fontFamily:"'Playfair Display',serif",color:"#8b6914",fontSize:16}}>Mini Box Andrérika</div>
      <div style={{color:"#8b7a50",fontSize:13}}>Carregando dados...</div>
    </div>
  );

  if(erroConexao) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#faf7f2",gap:16,padding:32,textAlign:"center"}}>
      <div style={{fontSize:48}}>📡</div>
      <div style={{fontFamily:"'Playfair Display',serif",color:"#3a2c0e",fontSize:20}}>Sem conexão</div>
      <div style={{color:"#8b7a50",fontSize:14}}>Verifique sua internet e tente novamente.</div>
      <button className="btn-primary" style={{marginTop:8}} onClick={carregar}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:"#faf7f2",minHeight:"100vh",maxWidth:480,margin:"0 auto",position:"relative"}}>
      <div style={{background:"#3a2c0e",padding:"20px 20px 16px",position:"sticky",top:0,zIndex:50}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:24}}>🏪</span>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",color:"#f5d78a",fontSize:16,fontWeight:700,lineHeight:1}}>Mini Box Andrérika</div>
            <div style={{color:"#c4a85a",fontSize:10}}>Sistema de Gestão</div>
          </div>
          {alertas.length>0&&(
            <div style={{marginLeft:"auto",background:"#e65100",color:"#fff",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
              <Icon name="alert" size={12}/> {alertas.length}
            </div>
          )}
        </div>
        <div style={{display:"flex",gap:5}}>
          {[
            {id:"dashboard",icon:"chart",label:"Início"},
            {id:"venda",icon:"cart",label:"Venda"},
            {id:"estoque",icon:"box",label:"Estoque"},
            {id:"notinhas",icon:"receipt",label:"Notinhas"},
            {id:"clientes",icon:"users",label:"Clientes"},
          ].map(t=>(
            <button key={t.id} className={tab===t.id?"tab-active":""} onClick={()=>setTab(t.id)}
              style={{flex:1,padding:"7px 2px",borderRadius:10,background:"rgba(255,255,255,.1)",color:"#c4a85a",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontSize:9,fontWeight:600,transition:".15s"}}>
              <Icon name={t.icon} size={15}/>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:16,paddingBottom:40}} className="animate-in">
        {tab==="dashboard"&&<Dashboard produtos={produtos} notinhasAbertas={notinhasAbertas} totalNotinhas={totalNotinhas} totalHoje={totalHoje} qtdHoje={vendasHoje.length} vendasHoje={vendasHoje} alertas={alertas} setTab={setTab} onReload={carregar}/>}
        {tab==="venda"&&<Venda produtos={produtos} clientes={clientes} movimentos={movimentos} vendas={vendas} sb={sb} showToast={showToast} setModal={setModal} onReload={()=>{reloadProdutos();reloadMovimentos();reloadVendas();}}/>}
        {tab==="estoque"&&<Estoque produtos={produtos} sb={sb} showToast={showToast} setModal={setModal} onReload={reloadProdutos}/>}
        {tab==="notinhas"&&<Notinhas movimentos={movimentos} clientes={clientes} produtos={produtos} sb={sb} showToast={showToast} setModal={setModal} onReload={()=>{reloadMovimentos();reloadProdutos();}}/>}
        {tab==="clientes"&&<Clientes clientes={clientes} movimentos={movimentos} sb={sb} showToast={showToast} setModal={setModal} onReload={reloadClientes}/>}
      </div>

      {modal&&(
        <div className="overlay" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            {modal.type==="novo-produto"&&<ModalProduto data={modal.data} onClose={()=>setModal(null)} sb={sb} showToast={showToast} onSave={()=>{setModal(null);reloadProdutos();showToast("Produto salvo!");}}/>}
            {modal.type==="nova-notinha"&&<ModalNotinha onClose={()=>setModal(null)} clientes={clientes} produtos={produtos} movimentos={movimentos} sb={sb} onSave={()=>{setModal(null);reloadMovimentos();reloadProdutos();showToast("Notinha lançada!");}}/>}
            {modal.type==="pagar-notinha"&&<ModalPagar data={modal.data} onClose={()=>setModal(null)} movimentos={movimentos} sb={sb} onSave={()=>{setModal(null);reloadMovimentos();showToast("Pagamento registrado! ✓");}}/>}
            {modal.type==="novo-cliente"&&<ModalCliente data={modal.data} onClose={()=>setModal(null)} sb={sb} onSave={()=>{setModal(null);reloadClientes();showToast("Cliente salvo!");}}/>}
            {modal.type==="entrada-estoque"&&<ModalEntrada data={modal.data} onClose={()=>setModal(null)} produtos={produtos} sb={sb} onSave={()=>{setModal(null);reloadProdutos();showToast("Estoque atualizado!");}}/>}
            {modal.type==="recibo"&&<ModalRecibo venda={modal.data} produtos={produtos} clientes={clientes} onClose={()=>setModal(null)}/>}
          </div>
        </div>
      )}
      {toast&&<div className={`toast ${toast.tipo==="err"?"err":""}`}>{toast.msg}</div>}
    </div>
  );
}

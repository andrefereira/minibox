import { useState } from "react";
import Icon from "../Icon.jsx";
import BarcodeScanner from "../BarcodeScanner.jsx";

export default function ModalProduto({data,onClose,sb,showToast,onSave}){
  const [form,setForm]=useState(data||{nome:"",categoria:"",preco:"",estoque:"",minimo:"",unidade:"un",codigo_barras:""});
  const [salvando,setSalvando]=useState(false);
  const [scanning,setScanning]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const salvar=async()=>{
    if(!form.nome||!form.preco)return alert("Preencha nome e preço");
    setSalvando(true);
    const payload={nome:form.nome,categoria:form.categoria,preco:parseFloat(form.preco),estoque:parseFloat(form.estoque)||0,minimo:parseInt(form.minimo)||3,unidade:form.unidade,codigo_barras:form.codigo_barras||null};
    if(data){await sb.from("produtos").update(payload).eq("id",data.id);}
    else{await sb.from("produtos").insert(payload);}
    setSalvando(false);onSave();
  };

  if(scanning) return <BarcodeScanner onResult={(codigo)=>{set("codigo_barras",codigo);setScanning(false);}} onClose={()=>setScanning(false)}/>;

  return(
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#2a1f06",marginBottom:20}}>{data?"Editar Produto":"Novo Produto"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={e=>set("nome",e.target.value)} placeholder="Ex: Queijo Canastra"/></div>
        <div>
          <label className="label">Código de barras</label>
          <div style={{display:"flex",gap:8}}>
            <input className="input" style={{flex:1}} value={form.codigo_barras||""} onChange={e=>set("codigo_barras",e.target.value)} placeholder="Opcional — para produtos industrializados"/>
            <button onClick={()=>setScanning(true)} style={{width:46,background:"#3a2c0e",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",color:"#f5d78a",flexShrink:0}}>
              <Icon name="scan" size={18}/>
            </button>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div><label className="label">Categoria</label><input className="input" value={form.categoria} onChange={e=>set("categoria",e.target.value)}/></div>
          <div><label className="label">Unidade</label>
            <select className="input" value={form.unidade} onChange={e=>set("unidade",e.target.value)}>
              {["un","kg","g","L","ml","cx","fardo"].map(u=><option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <div><label className="label">Preço R$</label><input className="input" type="number" step="0.01" value={form.preco} onChange={e=>set("preco",e.target.value)}/></div>
          <div><label className="label">Estoque</label><input className="input" type="number" value={form.estoque} onChange={e=>set("estoque",e.target.value)}/></div>
          <div><label className="label">Mínimo</label><input className="input" type="number" value={form.minimo} onChange={e=>set("minimo",e.target.value)}/></div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{flex:2,opacity:salvando?.6:1}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Salvar produto"}</button>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";

export default function ModalCliente({data,onClose,sb,onSave}){
  const [form,setForm]=useState(data||{nome:"",telefone:"",limite:300});
  const [salvando,setSalvando]=useState(false);
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const salvar=async()=>{
    if(!form.nome)return alert("Informe o nome");
    setSalvando(true);
    const payload={nome:form.nome,telefone:form.telefone,limite:parseFloat(form.limite)||300};
    if(data){await sb.from("clientes").update(payload).eq("id",data.id);}
    else{await sb.from("clientes").insert(payload);}
    setSalvando(false);onSave();
  };
  return(
    <>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#2a1f06",marginBottom:20}}>{data?"Editar Cliente":"Novo Cliente"}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div><label className="label">Nome</label><input className="input" value={form.nome} onChange={e=>set("nome",e.target.value)}/></div>
        <div><label className="label">Telefone</label><input className="input" value={form.telefone} onChange={e=>set("telefone",e.target.value)}/></div>
        <div><label className="label">Limite de crédito R$</label><input className="input" type="number" value={form.limite} onChange={e=>set("limite",e.target.value)}/></div>
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{flex:2,opacity:salvando?.6:1}} onClick={salvar} disabled={salvando}>{salvando?"Salvando...":"Salvar cliente"}</button>
        </div>
      </div>
    </>
  );
}

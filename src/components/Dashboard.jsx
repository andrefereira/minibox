import { fmt } from "../lib/format.js";
import { PAGAMENTOS } from "../lib/format.js";
import Icon from "./Icon.jsx";

export default function Dashboard({produtos,notinhasAbertas,totalNotinhas,totalHoje,qtdHoje,vendasHoje,alertas,setTab,onReload}){
  const porPag=PAGAMENTOS.map(p=>({...p,total:vendasHoje.filter(v=>v.pagamento===p.id).reduce((s,v)=>s+Number(v.total),0)})).filter(p=>p.total>0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{paddingTop:4,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:11,color:"#8b7a50",fontWeight:600,textTransform:"uppercase",letterSpacing:1}}>Resumo</div>
          <div className="section-title">Visão Geral</div>
        </div>
        <button className="btn-ghost" style={{fontSize:12,padding:"5px 10px"}} onClick={onReload}>↻ Atualizar</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {label:"Vendas hoje",value:fmt(totalHoje),sub:`${qtdHoje} venda${qtdHoje!==1?"s":""}`,icon:"cart",color:"#2e7d32",bg:"#e8f5e9"},
          {label:"Notinhas abertas",value:fmt(totalNotinhas),sub:`${notinhasAbertas.length} cliente${notinhasAbertas.length!==1?"s":""}`,icon:"receipt",color:"#e65100",bg:"#fff3e0"},
          {label:"Produtos cadastrados",value:`${produtos.length} itens`,sub:"no sistema",icon:"box",color:"#1565c0",bg:"#e3f2fd"},
          {label:"Alertas estoque",value:`${alertas.length} item${alertas.length!==1?"s":""}`,sub:"abaixo do mínimo",icon:"alert",color:alertas.length>0?"#c62828":"#2e7d32",bg:alertas.length>0?"#ffebee":"#e8f5e9"},
        ].map((k,i)=>(
          <div key={i} className="card">
            <div style={{width:32,height:32,borderRadius:10,background:k.bg,display:"flex",alignItems:"center",justifyContent:"center",color:k.color,marginBottom:8}}><Icon name={k.icon} size={16}/></div>
            <div style={{fontSize:18,fontWeight:700,color:"#2a1f06",lineHeight:1}}>{k.value}</div>
            <div style={{fontSize:11,color:"#8b7a50",marginTop:4}}>{k.label}</div>
            <div style={{fontSize:10,color:"#b0a080",marginTop:1}}>{k.sub}</div>
          </div>
        ))}
      </div>
      {porPag.length>0&&(
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,color:"#3a2c0e",marginBottom:10}}>Pagamentos de hoje</div>
          {porPag.map(p=>(
            <div key={p.id} className="row-item">
              <span style={{fontSize:14}}>{p.emoji} {p.label}</span>
              <span style={{fontWeight:700,color:"#2a1f06"}}>{fmt(p.total)}</span>
            </div>
          ))}
        </div>
      )}
      <button className="btn-green" style={{width:"100%",fontSize:16,padding:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8}} onClick={()=>setTab("venda")}>
        <Icon name="cart" size={18}/> Nova Venda
      </button>
      {alertas.length>0&&(
        <div className="card" style={{border:"1.5px solid #ffccbc"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,color:"#e65100"}}><Icon name="alert" size={15}/><span style={{fontWeight:700,fontSize:13}}>Repor estoque</span></div>
          {alertas.map(p=>(
            <div key={p.id} className="row-item">
              <div><div style={{fontSize:13,fontWeight:600,color:"#3a2c0e"}}>{p.nome}</div><div style={{fontSize:11,color:"#8b7a50"}}>{p.categoria}</div></div>
              <span className="badge-alert">{p.estoque} {p.unidade}</span>
            </div>
          ))}
        </div>
      )}
      {notinhasAbertas.length>0&&(
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,color:"#3a2c0e",marginBottom:10}}>Notinhas abertas</div>
          {notinhasAbertas.map(c=>(
            <div key={c.id} className="row-item">
              <span style={{fontSize:14,fontWeight:600,color:"#3a2c0e"}}>{c.nome}</span>
              <span style={{fontWeight:700,color:"#e65100"}}>{fmt(c.divida)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";

const PIN_CORRETO = "2321";

export default function LoginScreen({onLogin}){
  const [pin,setPin]=useState("");
  const [erro,setErro]=useState(false);
  const [shake,setShake]=useState(false);

  const digitar=(d)=>{
    if(pin.length>=4)return;
    const novo=pin+d;
    setPin(novo);
    setErro(false);
    if(novo.length===4){
      if(novo===PIN_CORRETO){
        sessionStorage.setItem("mb_auth","1");
        onLogin();
      } else {
        setShake(true);
        setErro(true);
        setTimeout(()=>{setPin("");setShake(false);},600);
      }
    }
  };

  const apagar=()=>{ setPin(p=>p.slice(0,-1)); setErro(false); };

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#3a2c0e",padding:32}}>
      <div style={{marginBottom:32,textAlign:"center"}}>
        <div style={{fontSize:56,marginBottom:12}}>🏪</div>
        <div style={{fontFamily:"'Playfair Display',serif",color:"#f5d78a",fontSize:24,fontWeight:700}}>Mini Box Andrérika</div>
        <div style={{color:"#c4a85a",fontSize:13,marginTop:4}}>Digite o PIN para entrar</div>
      </div>

      <div style={{display:"flex",gap:16,marginBottom:32,animation:shake?"shake .4s ease":"none"}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:18,height:18,borderRadius:"50%",background:i<pin.length?(erro?"#e53935":"#f5d78a"):"rgba(255,255,255,.2)",transition:"background .15s",border:"2px solid"+(i<pin.length?(erro?"#e53935":"#f5d78a"):"rgba(255,255,255,.3)")}}/>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,width:"100%",maxWidth:280}}>
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>digitar(String(n))}
            style={{height:64,borderRadius:16,background:"rgba(255,255,255,.1)",color:"#fff",fontSize:24,fontWeight:600,transition:".1s",border:"none"}}
            onTouchStart={e=>e.currentTarget.style.background="rgba(255,255,255,.25)"}
            onTouchEnd={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
            {n}
          </button>
        ))}
        <div/>
        <button onClick={()=>digitar("0")}
          style={{height:64,borderRadius:16,background:"rgba(255,255,255,.1)",color:"#fff",fontSize:24,fontWeight:600,border:"none"}}
          onTouchStart={e=>e.currentTarget.style.background="rgba(255,255,255,.25)"}
          onTouchEnd={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
          0
        </button>
        <button onClick={apagar}
          style={{height:64,borderRadius:16,background:"rgba(255,255,255,.08)",color:"#c4a85a",fontSize:20,border:"none"}}>
          ⌫
        </button>
      </div>

      {erro&&<div style={{color:"#ef9a9a",fontSize:13,marginTop:20,fontWeight:500}}>PIN incorreto. Tente novamente.</div>}
    </div>
  );
}

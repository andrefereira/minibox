import { useRef, useState, useEffect } from "react";
import Icon from "../Icon.jsx";

export default function SignaturePad({clienteNome,totalFmt,onConfirm,onCancel}){
  const canvasRef=useRef(null);
  const drawingRef=useRef(false);
  const hasDrawnRef=useRef(false);
  const lastPos=useRef({x:0,y:0});
  const [hasDrawn,setHasDrawn]=useState(false);

  useEffect(()=>{
    const canvas=canvasRef.current;
    const ratio=window.devicePixelRatio||1;
    const rect=canvas.getBoundingClientRect();
    canvas.width=rect.width*ratio;
    canvas.height=rect.height*ratio;
    const ctx=canvas.getContext("2d");
    ctx.scale(ratio,ratio);
    ctx.lineCap="round";
    ctx.lineJoin="round";
    ctx.lineWidth=2.5;
    ctx.strokeStyle="#2a1f06";
  },[]);

  const getPos=(e)=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const point=e.touches&&e.touches.length?e.touches[0]:e;
    return{x:point.clientX-rect.left,y:point.clientY-rect.top};
  };

  const start=(e)=>{
    e.preventDefault();
    drawingRef.current=true;
    lastPos.current=getPos(e);
  };
  const move=(e)=>{
    if(!drawingRef.current)return;
    e.preventDefault();
    const pos=getPos(e);
    const ctx=canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x,lastPos.current.y);
    ctx.lineTo(pos.x,pos.y);
    ctx.stroke();
    lastPos.current=pos;
    if(!hasDrawnRef.current){hasDrawnRef.current=true;setHasDrawn(true);}
  };
  const end=()=>{drawingRef.current=false;};

  const limpar=()=>{
    const canvas=canvasRef.current;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
    hasDrawnRef.current=false;
    setHasDrawn(false);
  };

  const confirmar=()=>{
    if(!hasDrawn)return;
    onConfirm(canvasRef.current.toDataURL("image/png"));
  };

  return(
    <div className="scan-overlay" style={{background:"#faf7f2"}}>
      <div style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",background:"#3a2c0e"}}>
        <span style={{color:"#f5d78a",fontWeight:600,fontSize:15}}>✍️ Assinatura da notinha</span>
        <button onClick={onCancel} style={{color:"#fff",background:"rgba(255,255,255,.15)",borderRadius:20,padding:"6px 12px",fontSize:13}}>Cancelar</button>
      </div>
      <div style={{padding:"14px 16px 0",textAlign:"center"}}>
        <div style={{fontSize:14,fontWeight:600,color:"#3a2c0e"}}>{clienteNome}</div>
        <div style={{fontSize:13,color:"#8b7a50"}}>{totalFmt} na notinha</div>
      </div>
      <div style={{flex:1,margin:16,background:"#fff",borderRadius:16,border:"1.5px dashed #d4b97a",position:"relative",overflow:"hidden"}}>
        <canvas
          ref={canvasRef}
          style={{width:"100%",height:"100%",touchAction:"none",display:"block"}}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
        {!hasDrawn&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#c4b088",fontSize:14,pointerEvents:"none"}}>
            Assine aqui com o dedo
          </div>
        )}
      </div>
      <div style={{padding:16,paddingTop:0,display:"flex",gap:10}}>
        <button className="btn-ghost" style={{flex:1}} onClick={limpar}>Limpar</button>
        <button className="btn-primary" style={{flex:2,opacity:hasDrawn?1:.5}} disabled={!hasDrawn} onClick={confirmar}>
          <Icon name="check" size={16}/> Confirmar assinatura
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function BarcodeScanner({onResult,onClose}){
  const videoRef=useRef(null);
  const readerRef=useRef(null);
  const [erro,setErro]=useState(null);
  const [status,setStatus]=useState("Iniciando câmera...");

  useEffect(()=>{
    let ativo=true;
    const reader=new BrowserMultiFormatReader();
    readerRef.current=reader;

    reader.listVideoInputDevices().then(devices=>{
      if(!ativo)return;
      if(devices.length===0){ setErro("Nenhuma câmera encontrada."); return; }
      const traseira=devices.find(d=>/back|traseira|rear|environment/i.test(d.label))||devices[devices.length-1];
      setStatus("Aponte para o código de barras");
      reader.decodeFromVideoDevice(traseira.deviceId, videoRef.current, (result,err)=>{
        if(result && ativo){
          ativo=false;
          if(navigator.vibrate) navigator.vibrate(100);
          onResult(result.getText());
          reader.reset();
        }
      });
    }).catch(e=>{
      setErro("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
    });

    return ()=>{ ativo=false; try{reader.reset();}catch{} };
  },[]);

  return(
    <div className="scan-overlay">
      <div style={{padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",zIndex:2}}>
        <span style={{color:"#fff",fontWeight:600,fontSize:15}}>📷 Escanear produto</span>
        <button onClick={onClose} style={{color:"#fff",background:"rgba(255,255,255,.15)",borderRadius:20,padding:"6px 12px",fontSize:13}}>Fechar ✕</button>
      </div>
      <div style={{flex:1,position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <video ref={videoRef} style={{width:"100%",height:"100%",objectFit:"cover"}} muted playsInline/>
        {!erro && <div className="scan-frame"/>}
        {erro && (
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center"}}>
            <div style={{background:"#fff",borderRadius:16,padding:24}}>
              <div style={{fontSize:32,marginBottom:8}}>🚫</div>
              <div style={{color:"#3a2c0e",fontWeight:600,fontSize:14}}>{erro}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{padding:20,textAlign:"center",color:"#c4a85a",fontSize:13}}>{erro?"":status}</div>
    </div>
  );
}

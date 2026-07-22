export const fmt = n => Number(n).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
export const fmtDate = iso => new Date(iso).toLocaleDateString("pt-BR");
export const fmtTime = iso => new Date(iso).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
export const now = () => new Date().toISOString();

export const PAGAMENTOS = [
  {id:"dinheiro",label:"Dinheiro",emoji:"💵"},
  {id:"pix",label:"Pix",emoji:"⚡"},
  {id:"debito",label:"Débito",emoji:"💳"},
  {id:"credito",label:"Crédito",emoji:"💳"},
  {id:"notinha",label:"Notinha",emoji:"📋"},
];

export async function compartilhar(el, nome="recibo.png") {
  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(el,{backgroundColor:"#faf7f2",scale:2,useCORS:true,logging:false});
  return new Promise((res,rej)=>{
    canvas.toBlob(async blob=>{
      if(!blob){rej(new Error("erro"));return;}
      const file=new File([blob],nome,{type:"image/png"});
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        try{await navigator.share({files:[file],title:"Recibo Mini Box Andrérika"});res("shared");}
        catch(e){if(e.name!=="AbortError")rej(e);else res("aborted");}
      } else {
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");a.href=url;a.download=nome;a.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        res("downloaded");
      }
    },"image/png");
  });
}

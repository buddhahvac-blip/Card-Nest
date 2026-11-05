'use client';
import {useEffect,useState} from 'react';

const productOptions=['30th Anniversary ETB','30th Anniversary ETB bundle','Destined Rivals','Prismatic Evolutions','Surging Sparks','Graded cards and singles','Other Pokémon product'];

export default function OrderRequest(){
  const [product,setProduct]=useState(productOptions[0]);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [quantity,setQuantity]=useState(1);
  const [zip,setZip]=useState('');
  const [notes,setNotes]=useState('');
  const [website,setWebsite]=useState('');
  const [sending,setSending]=useState(false);
  const [message,setMessage]=useState('');
  const [success,setSuccess]=useState(false);

  useEffect(()=>{
    function selectProduct(e:MouseEvent){
      if(!(e.target instanceof Element))return;
      const anchor=e.target.closest<HTMLAnchorElement>('a[data-shop-select]');
      const selected=anchor?.dataset.shopSelect;
      if(selected&&productOptions.includes(selected)){setProduct(selected);setMessage('');setSuccess(false)}
    }
    document.addEventListener('click',selectProduct);
    return ()=>document.removeEventListener('click',selectProduct);
  },[]);

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    setSending(true);setMessage('');setSuccess(false);
    try{
      if(!/^\d{5}$/.test(zip))throw Error('Enter a valid five-digit US shipping ZIP code.');
      const summary=['Pokémon collector purchase inquiry',`Product: ${product}`,`Quantity: ${quantity}`,`Shipping ZIP: ${zip}`,'Please confirm actual in-hand inventory, sealed condition, photographs, shipping/insurance, tax, expected dispatch and refund terms BEFORE requesting payment.',notes?`Customer notes: ${notes}`:''].filter(Boolean).join('\n');
      const response=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,category:'general',subject:`Pokémon purchase request: ${product}`.slice(0,120),message:summary,website})});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'The request could not be submitted.');
      setSuccess(true);setMessage(`Request received. Reference ${data.code}. We will confirm pricing, shipping and actual availability before any payment.`);
      window.dispatchEvent(new CustomEvent('nestrune:collector-order-request',{detail:{product}}));
      setNotes('');
    }catch(error){setMessage(error instanceof Error?error.message:'Please try again.')}finally{setSending(false)}
  }

  return <section id='request-order' className='ns-request' aria-label='Pokémon product purchase request'>
    <div><span className='ns-request-kicker'>READY TO ORDER?</span><h2>Request a confirmed purchase quote</h2>
      <p>No payment is taken here. We confirm physical stock and actual item photos, then provide shipping, taxes and written terms before sending payment instructions.</p>
    </div>
    <form onSubmit={submit}>
      <label>Choose product<select value={product} onChange={e=>setProduct(e.target.value)}>{productOptions.map(v=><option key={v}>{v}</option>)}</select></label>
      <label>Full name<input required minLength={2} maxLength={80} autoComplete='name' value={name} onChange={e=>setName(e.target.value)}/></label>
      <label>Email for your quote<input required type='email' maxLength={254} autoComplete='email' value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <div className='ns-request-row'><label>Quantity<input required type='number' min={1} max={4} value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/></label>
      <label>US shipping ZIP<input required inputMode='numeric' autoComplete='postal-code' pattern='[0-9]{5}' placeholder='96740' value={zip} onChange={e=>setZip(e.target.value)}/></label></div>
      <label>Questions or requests (optional)<textarea maxLength={500} rows={3} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
      <label className='ns-honeypot' aria-hidden='true'>Website<input tabIndex={-1} autoComplete='off' value={website} onChange={e=>setWebsite(e.target.value)}/></label>
      <p className='ns-request-terms'>Submitting is an inquiry, not a reservation or completed sale. No card details or full shipping address are collected here.</p>
      <button type='submit' disabled={sending}>{sending?'Sending request…':'SEND PURCHASE REQUEST →'}</button>
      {message&&<p className={success?'ns-request-confirm':'ns-request-error'} role='status'>{message}</p>}
    </form>
    <style>{`
      .ns-request{margin:26px 0 30px;padding:26px;border:1px solid #ad8950;border-radius:20px;background:linear-gradient(120deg,#202c4d,#141b32);display:grid;grid-template-columns:.82fr 1.18fr;gap:24px}
      .ns-request-kicker{font-size:11px;letter-spacing:2px;color:#f8dc98}.ns-request h2{font-size:26px;line-height:1.12}.ns-request p{color:#cbd0e0;line-height:1.6}
      .ns-request form{display:grid;gap:11px}.ns-request label{display:grid;gap:6px;font-size:12px;color:#f2d28e;font-weight:700}
      .ns-request input,.ns-request textarea,.ns-request select{border:1px solid #65718e;border-radius:9px;padding:12px;width:100%;font:inherit;font-size:15px;color:white;background:#0e1730;min-width:0}
      .ns-request option{background:#15203c}.ns-request-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ns-honeypot{position:absolute;left:-9999px;opacity:0;pointer-events:none}
      .ns-request .ns-request-terms{font-size:12px;margin:0}.ns-request button{border:0;border-radius:12px;background:#f2ca7b;color:#19223a;padding:14px;font-weight:900;letter-spacing:.5px;cursor:pointer}
      .ns-request button:disabled{opacity:.7;cursor:wait}.ns-request-confirm{color:#aef3c6!important}.ns-request-error{color:#ffc1c1!important}
      @media(max-width:700px){.ns-request{grid-template-columns:1fr;padding:20px}.ns-request h2{font-size:23px}}
    `}</style>
  </section>;
}

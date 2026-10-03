import {Policy} from '../policy';
import SupportForm from './support-form';

export default function Page(){
 const email=process.env.SUPPORT_EMAIL||'cardnestsupport@gmail.com';
 return <Policy title="CardNest support">
  <h2>Need help with your nest?</h2>
  <p>Use the support form below to create a CardNest ticket, or email <a href={'mailto:'+email}>{email}</a>. Keep your ticket number if you use the form.</p>
  <SupportForm/>
  <h2>Public beta support</h2>
  <p>During beta, our response target is within two business days, though complex issues may take longer. If a reveal stops, reload My Nest and replay your saved pack opening. Replaying does not create another card copy.</p>
  <p>Founder payment tests are not a public sales channel. Do not send passwords, full payment-card numbers, tax IDs, recovery codes, or banking information.</p>
 </Policy>
}
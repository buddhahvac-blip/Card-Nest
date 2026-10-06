import {Policy} from '../policy';
import SupportForm from './support-form';

export default function Page(){
 const email=process.env.SUPPORT_EMAIL?.trim();
 return <Policy title="NestRune support">
  <h2>Need help with your nest?</h2>
  <p>Use the support form below to create a NestRune ticket{email?<> or email <a href={'mailto:'+email}>{email}</a></>:null}. Keep your ticket number if you use the form.</p>
  <SupportForm/>
 </Policy>
}

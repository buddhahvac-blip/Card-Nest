import type {Metadata} from 'next';
import Link from 'next/link';
import FeedbackCard from '@/app/feedback-card';

export const metadata:Metadata={title:'Help Shape CardNest',description:'Share five quick anonymous beta signals to help CardNest learn what collectors actually care about.',alternates:{canonical:'/feedback'}};

export default function FeedbackPage(){
 return <main className="shell">
  <Link className="brand" href="/">✧ Card<span>Nest</span></Link>
  <div className="eyebrow">PUBLIC BETA</div>
  <h1 className="page-title">Help shape the Great Nest.</h1>
  <p className="intro">We are validating the collecting experience before expanding production. Your feedback helps us decide what deserves more attention.</p>
  <FeedbackCard/>
  <Link className="outline" href="/">Return to CardNest</Link>
 </main>;
}

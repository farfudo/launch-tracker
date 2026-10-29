import {redirect} from 'next/navigation';
import {readAdminSession} from '../../../lib/admin-auth';
import {FeedbackAdminClient} from '../../../components/feedback-admin-client';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
export default async function AdminFeedbackPage(){const session=await readAdminSession();if(!session)redirect('/admin/login');return <FeedbackAdminClient initialSession={session}/>;}

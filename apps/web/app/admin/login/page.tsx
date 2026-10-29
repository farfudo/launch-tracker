import {redirect} from 'next/navigation';
import {adminSettings,readAdminSession} from '../../../lib/admin-auth';
import {AdminLogin} from '../../../components/admin-login';
export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
export default async function AdminLoginPage({searchParams}:{searchParams:Promise<{expired?:string}>}){const expired=(await searchParams).expired==='1';if(!expired&&await readAdminSession())redirect('/admin/feedback');return <AdminLogin enabled={!!adminSettings()} expired={expired}/>;}

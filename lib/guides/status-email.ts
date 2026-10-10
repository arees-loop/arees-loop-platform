import {Resend} from "resend";
export async function sendGuideStatusEmail(to:string,name:string,status:string,notes:string){
 const key=process.env.RESEND_API_KEY;
 if(!key)throw new Error("Email not configured");
 const resend=new Resend(key);
 const subject=status==="APPROVED"?"اعتماد طلب المرشد":status==="NEEDS_COMPLETION"?"استكمال طلب المرشد":"نتيجة طلب المرشد";
 const {error}=await resend.emails.send({from:process.env.EMAIL_FROM||"Arees Loop <no-reply@areesloop.com>",to:[to],subject:subject+" | Arees Loop",text:"مرحباً "+name+"\n"+subject+"\nملاحظات الإدارة:\n"+notes+"\nيرجى الدخول إلى حسابك في أريس لوب."});
 if(error)throw new Error(error.message);
}

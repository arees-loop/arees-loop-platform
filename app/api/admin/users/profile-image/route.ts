import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

const ALLOWED = new Set(["image/jpeg","image/png","image/webp"]);
const MAX = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({success:false,message:"يجب تسجيل الدخول أولاً."},{status:401});
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({success:false,message:"غير مصرح."},{status:403});
  try {
    const form = await request.formData();
    const file = form.get("file");
    const userId = form.get("userId");
    if (!(file instanceof File) || typeof userId !== "string") return NextResponse.json({success:false,message:"الصورة والمستخدم مطلوبان."},{status:400});
    if (!ALLOWED.has(file.type)) return NextResponse.json({success:false,message:"يسمح بصور JPG أو PNG أو WEBP فقط."},{status:415});
    if (file.size <= 0 || file.size > MAX) return NextResponse.json({success:false,message:"حجم الصورة يجب ألا يتجاوز 5 ميجابايت."},{status:413});
    const target = await prisma.user.findUnique({where:{id:userId},select:{id:true,role:true}});
    if (!target || !["ADMIN","SUPER_ADMIN"].includes(target.role)) return NextResponse.json({success:false,message:"المستخدم الإداري غير موجود."},{status:404});
    const ext=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
    const blob=await put(`admin-users/${userId}/${crypto.randomUUID()}.${ext}`,file,{access:"public",addRandomSuffix:false});
    await prisma.user.update({where:{id:userId},data:{profileImageUrl:blob.url}});
    return NextResponse.json({success:true,message:"تم تحديث الصورة الشخصية.",url:blob.url});
  } catch(error) {
    console.error("POST /api/admin/users/profile-image error:",error);
    return NextResponse.json({success:false,message:"تعذر رفع الصورة الشخصية."},{status:500});
  }
}

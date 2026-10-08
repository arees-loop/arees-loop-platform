import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/session";

export async function GET() {
  const session = await getCurrentSession();
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({success:false,message:"غير مصرح"}, {status:401});
  }
  const [wallets, totals, transactions] = await Promise.all([
    prisma.loyaltyWallet.aggregate({_count:{_all:true},_sum:{balance:true}}),
    prisma.loyaltyTransaction.groupBy({by:["type"],_count:{_all:true},_sum:{points:true}}),
    prisma.loyaltyTransaction.findMany({orderBy:{createdAt:"desc"},take:100,include:{user:{select:{email:true,firstName:true,lastName:true}}}})
  ]);
  return NextResponse.json({success:true,data:{
    walletCount:wallets._count._all,
    outstandingPoints:wallets._sum.balance ?? 0,
    totals:totals.map(t=>({type:t.type,count:t._count._all,points:t._sum.points??0})),
    transactions:transactions.map(t=>({id:t.id,type:t.type,points:t.points,description:t.description,referenceId:t.referenceId,createdAt:t.createdAt,userName:[t.user.firstName,t.user.lastName].filter(Boolean).join(" ")||t.user.email,email:t.user.email}))
  }});
}

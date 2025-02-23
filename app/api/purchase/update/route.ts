import { NextResponse } from "next/server";
import  {prisma}  from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    
    const updatedPurchase = await prisma.purchase.update({
      where: { id: body.id },
      data: {
        title: body.title,
        amount: parseFloat(body.amount),
        quantity: parseFloat(body.quantity),
        supplierId: body.supplierId,
        datePurchased: new Date(body.datePurchased),
      },
    });

    return NextResponse.json(updatedPurchase, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update purchase" }, { status: 500 });
  }
}

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(
  req: Request
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    const date = searchParams.get("date");

    if (!shopId) {
      return new NextResponse("Shop ID is required", { status: 400 });
    }

    const incomes = await db.income.findMany({
      where: {
        shopId,
        ...(date && {
          date: {
            gte: new Date(date),
            lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
          }
        })
      },
      include: {
        worker: {
          select: {
            name: true
          }
        },
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formatear los datos para el Excel
    const data = incomes.map((income) => ({
      Fecha: format(new Date(income.date), "dd/MM/yyyy", { locale: es }),
      "N° Ticket": income.ticketNumber,
      Profesional: income.worker.name,
      Servicio: income.service.name,
      "Método de Pago": income.paymentMethod === 'split' 
        ? 'Dividido'
        : income.paymentMethod === 'efectivo' 
          ? 'Efectivo' 
          : income.paymentMethod === 'redcompra'
            ? 'Redcompra'
            : 'Plataforma',
      "Monto Tarjeta": income.cardAmount || 0,
      "Monto Efectivo": income.cashAmount || 0,
      "Monto Total": income.amount,
      "Observación": income.observation || ''
    }));

    // Crear el libro de Excel
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");

    // Generar el buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Retornar el archivo
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ingresos-${format(new Date(), 'dd-MM-yyyy')}.xlsx"`
      }
    });

  } catch (error) {
    console.error("[INCOME_EXPORT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 
import { NextResponse } from "next/server"
import { getFreeClimbConfig } from "../../lib/freeclimb"
import { getPersonalNumber } from "../../lib/personalNumber"

export const dynamic = "force-dynamic"

export async function GET() {
  const config = getFreeClimbConfig()
  const personal = getPersonalNumber()

  return NextResponse.json({
    freeclimbNumber: config?.fromNumber ?? null,
    personalNumber: personal.number,
    personalNumberSource: personal.source,
    credentialsConfigured: Boolean(config),
  })
}

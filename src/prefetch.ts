import fy2024Data from './fy2024.json'
import { mkdir } from 'node:fs/promises'
import path from 'path'

interface SpendingData {
  type: string
  filters: {
    fy: string
    period: string
    agency: string
    federal_account?: string
  }
}

interface SpendingResponse {
  total: number
  end_date: string
  results: Array<{
    id: string
    code: string
    type: string
    name: string
    amount: number
    account_number?: string
  }>
}

async function fetchAgencySpending(agency: string): Promise<SpendingResponse> {
  console.log('fetching data for agency', agency)

  const data: SpendingData = {
    type: 'federal_account',
    filters: {
      fy: '2024',
      period: '12',
      agency,
    },
  }

  const response = await fetch('https://api.usaspending.gov/api/v2/spending/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', errorText)
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
  }

  const jsonData = (await response.json()) as SpendingResponse
  console.log('received data for agency', agency)
  return jsonData
}

async function fetchAccountSpending(account: string, agency: string): Promise<SpendingResponse> {
  console.log('fetching data for account', account, 'agency', agency)

  const data: SpendingData = {
    type: 'program_activity',
    filters: {
      fy: '2024',
      period: '12',
      agency,
      federal_account: account,
    },
  }

  const response = await fetch('https://api.usaspending.gov/api/v2/spending/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error:', errorText)
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
  }

  const jsonData = (await response.json()) as SpendingResponse
  console.log('received data for account', account)
  return jsonData
}

async function main() {
  // Create public/data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'public', 'data')
  await mkdir(dataDir, { recursive: true })

  // Get all agencies with IDs from fy2024Data
  const agencies = fy2024Data.results.filter(agency => agency.id !== null)

  // Add a delay between requests to avoid rate limiting
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  for (const agency of agencies) {
    try {
      const agencyFilePath = path.join(dataDir, `agency_${agency.id}.json`)
      const agencyFile = Bun.file(agencyFilePath)
      let agencyData: SpendingResponse

      // Check if we need to fetch agency data
      if (await agencyFile.exists()) {
        console.log(`Loading existing agency data for ${agency.id}`)
        agencyData = JSON.parse(await agencyFile.text())
      } else {
        agencyData = await fetchAgencySpending(agency.id!)
        await Bun.write(agencyFilePath, JSON.stringify(agencyData, null, 2))
        console.log(`Saved data for agency ${agency.id} to ${agencyFilePath}`)
        await delay(1000)
      }

      // Now fetch data for each account in this agency
      for (const account of agencyData.results) {
        if (!account.id) continue

        const accountFilePath = path.join(dataDir, `agency_${agency.id}_account_${account.id}.json`)
        const accountFile = Bun.file(accountFilePath)

        if (await accountFile.exists()) {
          console.log(`Skipping account ${account.id}, file already exists`)
          continue
        }

        const accountData = await fetchAccountSpending(account.id, agency.id!)
        await Bun.write(accountFilePath, JSON.stringify(accountData, null, 2))
        console.log(`Saved data for account ${account.id} to ${accountFilePath}`)
        // wait 5 milliseconds
        // await delay(5)
      }

    } catch (error) {
      console.error(`Failed to process agency ${agency.id}:`, error)
    }
  }
}

main().catch(console.error) 
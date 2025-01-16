import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { z } from 'zod'
import "../index.css"
import { UserAmountProvider } from '../UserAmountContext'

interface SpendingData {
  type: string
  filters: {
    fy: string
    period: string
    agency: string
    federal_account?: string
  }
}

export interface SpendingResponse {
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
  console.log('received data:', jsonData)
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
  console.log('received data:', jsonData)
  return jsonData
}

export interface RouterContext {
  fetchAgencySpending: (agency: string) => Promise<SpendingResponse>
  fetchAccountSpending: (account: string, agency: string) => Promise<SpendingResponse>
}

export const searchSchema = z.object({
  view: z.enum(['tree', 'list']).default('tree'),
  agency: z.string().optional()
})

export type SearchParams = z.infer<typeof searchSchema>

function Footer() {
  return (
    <footer>
              <div>FY 2024 OBLIGATED AMOUNT</div>
              <div>Data as of September 29, 2024</div>
    </footer>
  )
}

export const Route = createRootRoute({
  component: () => (
    <UserAmountProvider>
      <Outlet />
      <Footer />
      <TanStackRouterDevtools />
    </UserAmountProvider>
  ),
  validateSearch: searchSchema,
  context: (): RouterContext => ({
    fetchAgencySpending,
    fetchAccountSpending,
  })
})
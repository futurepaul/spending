import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { z } from 'zod'
import { UserAmountProvider } from '../UserAmountContext'

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

async function fetchLocalAgencySpending(agency: string): Promise<SpendingResponse> {
  console.log('fetching local data for agency', agency)
  const response = await fetch(`/data/agency_${agency}.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch local agency data: ${response.status}`)
  }
  const data = await response.json()
  console.log('received local data:', data)
  return data
}

async function fetchLocalAccountSpending(account: string, agency: string): Promise<SpendingResponse> {
  console.log('fetching local data for account', account, 'agency', agency)
  const response = await fetch(`/data/agency_${agency}_account_${account}.json`)
  if (!response.ok) {
    throw new Error(`Failed to fetch local account data: ${response.status}`)
  }
  const data = await response.json()
  console.log('received local data:', data)
  return data
}

export interface RouterContext {
  fetchLocalAgencySpending: (agency: string) => Promise<SpendingResponse>
  fetchLocalAccountSpending: (account: string, agency: string) => Promise<SpendingResponse>
}

export const searchSchema = z.object({
  view: z.enum(['tree', 'list']).default('tree'),
  agency: z.string().optional()
})

export type SearchParams = z.infer<typeof searchSchema>

export const Route = createRootRoute({
  component: () => (
    <UserAmountProvider>
        <Outlet />
        <TanStackRouterDevtools />
    </UserAmountProvider>
  ),
  validateSearch: searchSchema,
  context: (): RouterContext => ({
    fetchLocalAgencySpending,
    fetchLocalAccountSpending,
  })
})
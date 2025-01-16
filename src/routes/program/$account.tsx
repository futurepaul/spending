import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../../TreeView'
import { ListView } from '../../ListView'
import { Titlebar } from '../../Titlebar'
import { ViewToggle } from '../../ViewToggle'
import { SearchParams, searchSchema } from '../__root'

interface SpendingData {
  type: string
  filters: {
    fy: string
    period: string
    agency: string
    federal_account: string
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
  }>
}

async function fetchSpendingData(account: string, agency: string) {
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

export const Route = createFileRoute('/program/$account')({
  validateSearch: searchSchema,
  loaderDeps: ({ search: { agency } }) => ({ agency }),
  loader: async ({ params, deps: { agency } }) => {
    if (!agency) throw new Error('Agency is required')
    return fetchSpendingData(params.account, agency)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/program/$account' }) as SearchParams
  const navigate = useNavigate()
  const { account } = Route.useParams()
  const data = Route.useLoaderData()

  const treeData: TreeViewData[] = data.results.map((item) => ({
    name: item.name,
    id: item.id,
    value: item.amount,
  }))

  return (
    <div>
      <ViewToggle
        view={search.view}
        onViewChange={(newView) => {
          navigate({
            to: '/program/$account',
            params: { account },
            search: { view: newView },
          })
        }}
      />
      <Titlebar
        title={data.results[0]?.name || `Account ${account}`}
        total={data.total}
      />
      {search.view === 'tree' ? (
        <TreeView data={treeData} title={`Account ${account} Programs`} />
      ) : (
        <ListView data={treeData} />
      )}
    </div>
  )
} 
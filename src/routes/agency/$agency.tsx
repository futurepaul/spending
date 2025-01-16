import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../../TreeView'
import { ListView } from '../../ListView'
import { Titlebar } from '../../Titlebar'
import { ViewToggle } from '../../ViewToggle'
import { SearchParams } from '../__root'
import fy2024Data from '../../fy2024.json'

interface SpendingData {
  type: string
  filters: {
    fy: string
    period: string
    agency: string
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
    account_number: string
  }>
}

async function fetchSpendingData(agency: string) {
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

export const Route = createFileRoute('/agency/$agency')({
  loader: async ({ params }) => {
    return fetchSpendingData(params.agency)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/agency/$agency' }) as SearchParams
  const navigate = useNavigate()
  const { agency } = Route.useParams()
  const data = Route.useLoaderData()

  const matchingAgency = fy2024Data.results.find(a => a.id === agency)
  const agencyName = matchingAgency?.name || `Agency ${agency}`

  const treeData: TreeViewData[] = data.results.map((item) => ({
    name: item.name,
    id: item.id,
    value: item.amount,
    metadata: { account_number: item.account_number }
  }))

  return (
    <div>
      <ViewToggle
        view={search.view}
        onViewChange={(newView) => {
          navigate({
            to: '/agency/$agency',
            params: { agency },
            search: { view: newView },
          })
        }}
      />
      <Titlebar
        title={agencyName}
        total={data.total}
        breadcrumbs={[
          {
            name: "All Agencies",
            to: "/",
            search: { view: search.view }
          }
        ]}
      />
      {search.view === 'tree' ? (
        <TreeView 
          data={treeData} 
          title={`Agency ${agency} Spending`}
          onItemClick={(item) => {
            if (item.id) {
              navigate({
                to: '/program/$account',
                params: { account: item.id },
                search: { view: search.view, agency }
              })
            }
          }}
        />
      ) : (
        <ListView 
          data={treeData}
          onItemClick={(item) => {
            if (item.id) {
              navigate({
                to: '/program/$account',
                params: { account: item.id },
                search: { view: search.view, agency }
              })
            }
          }}
        />
      )}
    </div>
  )
}

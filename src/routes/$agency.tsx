import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../TreeView'
import { ListView } from '../ListView'
import { Titlebar } from '../Titlebar'
import { ViewToggle } from '../ViewToggle'
import { SearchParams } from './__root'

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
  console.log("fetching data for agency", agency)
  
  const data: SpendingData = {
    type: "federal_account",
    filters: {
      fy: "2024",
      period: "12",
      agency
    }
  }

  const response = await fetch("https://api.usaspending.gov/api/v2/spending/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("API Error:", errorText)
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
  }

  const jsonData = await response.json() as SpendingResponse
  console.log("received data:", jsonData)
  return jsonData
}

export const Route = createFileRoute('/$agency')({
  loader: async ({ params }) => {
    return fetchSpendingData(params.agency)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/$agency' }) as SearchParams
  const navigate = useNavigate()
  const { agency } = Route.useParams()
  const data = Route.useLoaderData()
  
  const treeData: TreeViewData[] = data.results.map(item => ({
    name: item.name,
    id: item.id,
    value: item.amount
  }))

  return (
    <div>
      <ViewToggle 
        view={search.view} 
        onViewChange={(newView) => {
          navigate({ 
            to: '/$agency',
            params: { agency },
            search: { view: newView }
          })
        }} 
      />
      <Titlebar 
        title={data.results[0]?.name || `Agency ${agency}`}
        total={data.total}
      />
      {search.view === 'tree' ? (
        <TreeView 
          data={treeData} 
          title={`Agency ${agency} Spending`}
        />
      ) : (
        <ListView 
          data={treeData}
        />
      )}
    </div>
  )
}
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../TreeView'
import { ListView } from '../ListView'
import { Titlebar } from '../Titlebar'
import { ViewToggle } from '../ViewToggle'
import { SearchParams, searchSchema, RouterContext, SpendingResponse } from './__root'
import fy2024Data from '../fy2024.json'

interface LoaderData {
  agencyData: SpendingResponse
  accountData: SpendingResponse
}

export const Route = createFileRoute('/agency_/$agencyId/account/$accountId')<{
  context: RouterContext,
  loaderData: LoaderData
}>({
  validateSearch: searchSchema,
  loader: async ({ params, context }) => {
    const [agencyData, accountData] = await Promise.all([
      context.fetchLocalAgencySpending(params.agencyId),
      context.fetchLocalAccountSpending(params.accountId, params.agencyId),
    ])
    return { agencyData, accountData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/agency_/$agencyId/account/$accountId' }) as SearchParams
  const navigate = useNavigate()
  const { accountId, agencyId } = Route.useParams()
  const { agencyData, accountData } = Route.useLoaderData() as LoaderData

  // Find the agency name from the static data
  const matchingAgency = fy2024Data.results.find((a) => a.id === agencyId)
  const agencyName = matchingAgency?.name || `Agency ${agencyId}`

  // Find the account name from the agency data
  const account = agencyData.results.find((item) => item.id === accountId)
  const accountName = account?.name || `Account ${accountId}`

  // Calculate the account's percentage of the agency's total
  const accountPercentage = account ? account.amount / agencyData.total : 0

  const treeData: TreeViewData[] = accountData.results.map((item) => ({
    name: item.name,
    id: item.id,
    value: item.amount,
  }))

  return (
    <div>
      <Titlebar
        title={accountName}
        total={accountData.total}
        breadcrumbs={[
          {
            name: 'All Agencies',
            to: '/',
            search: { view: search.view },
          },
          {
            name: agencyName,
            to: '/agency/$agencyId',
            params: { agencyId },
            search: { view: search.view },
          },
        ]}
      />
      <div className="flex-header">
        <h1 className="marker">Programs</h1>
        <ViewToggle
          view={search.view}
          onViewChange={(newView) => {
            navigate({
              to: ".",
              params: { accountId, agencyId },
              search: { view: newView },
            })
          }}
        />
      </div>
      {search.view === 'tree' ? (
        <TreeView data={treeData} title={`${accountName} Programs`} onItemClick={undefined} parentPercentage={accountPercentage} />
      ) : (
        <ListView data={treeData} onItemClick={undefined} parentPercentage={accountPercentage} />
      )}
    </div>
  )
}

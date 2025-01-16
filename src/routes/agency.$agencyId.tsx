import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../TreeView'
import { ListView } from '../ListView'
import { Titlebar } from '../Titlebar'
import { ViewToggle } from '../ViewToggle'
import { SearchParams, RouterContext, SpendingResponse } from './__root'
import fy2024Data from '../fy2024.json'

export const Route = createFileRoute('/agency/$agencyId')<{
  context: RouterContext,
  loaderData: SpendingResponse
}>({
  loader: async ({ params, context }) => {
    return context.fetchAgencySpending(params.agencyId)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = useSearch({ from: '/agency/$agencyId' }) as SearchParams
  const navigate = useNavigate()
  const { agencyId } = Route.useParams()
  const data = Route.useLoaderData() as SpendingResponse

  const matchingAgency = fy2024Data.results.find((a) => a.id === agencyId)
  const agencyName = matchingAgency?.name || `Agency ${agencyId}`
  
  // Calculate the agency's percentage of the total budget
  const agencyPercentage = matchingAgency ? matchingAgency.amount / fy2024Data.total : 0

  const treeData: TreeViewData[] = data.results.map((item) => ({
    name: item.name,
    id: item.id,
    value: item.amount,
    metadata: { account_number: item.account_number },
  }))

  return (
    <div>
      <Titlebar
        title={agencyName}
        total={data.total}
        breadcrumbs={[
          {
            name: 'All Agencies',
            to: '/',
            search: { view: search.view },
          },
        ]}
      />
      <ViewToggle
        view={search.view}
        onViewChange={(newView) => {
          navigate({
            to: ".",
            params: { agencyId },
            search: { view: newView },
          })
        }}
      />
      {search.view === 'tree' ? (
        <TreeView
          data={treeData}
          title={`Agency ${agencyId} Spending`}
          parentPercentage={agencyPercentage}
          onItemClick={(item) => {
            if (item.id) {
              navigate({
                to: '/agency/$agencyId/account/$accountId',
                params: { accountId: item.id, agencyId },
                search: { view: search.view },
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
                to: '/agency/$agencyId/account/$accountId',
                params: { accountId: item.id, agencyId },
                search: { view: search.view },
              })
            }
          }}
        />
      )}
    </div>
  )
}

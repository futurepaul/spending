import { createLazyFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { TreeView, TreeViewData } from '../TreeView'
import { ListView } from '../ListView'
import { Titlebar } from '../Titlebar'
import { ViewToggle } from '../ViewToggle'
import apiData from '../fy2024.json'
import { SearchParams } from './__root'

interface ApiResponse {
  total: number;
  end_date: string;
  results: Array<{
    id: string | null;
    code: string | null;
    type: string;
    name: string;
    amount: number;
    link: boolean;
  }>;
}

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const search = useSearch({ from: '/' }) as SearchParams
  const navigate = useNavigate()
  const data = apiData as ApiResponse;
  const treeData: TreeViewData[] = data.results
    .filter(agency => agency.amount > 0)
    .filter(agency => agency.id !== null)
    .map(agency => ({
      name: agency.name,
      id: agency.id as string,
      value: agency.amount
    }));

  return (
    <div>
      <ViewToggle 
        view={search.view} 
        onViewChange={(newView) => {
          navigate({ to: '/', search: { view: newView } })
        }} 
      />
      <Titlebar 
        title="2024 Spending by Agency" 
        total={data.total}
        breadcrumbs={[]}
      />
      {search.view === 'tree' ? (
        <TreeView data={treeData} />
      ) : (
        <ListView data={treeData} />
      )}
    </div>
  )
}
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

function BudgetStack() {
    // 9.7 trillion
    const obligatedAmount = 9700000000000
    // 6.752 trillion
    const outlays = 6752000000000
    // 4.919 trillion
    const revenue = 4919000000000

    // Ex: $1.43T
    // Ex: $1.43B
    const formatNumber = (n: number) => {
        if (n > 1000000000000) {
            return `$${(n / 1000000000000).toFixed(2)}T`
        } else if (n > 1000000000) {
            return `$${(n / 1000000000).toFixed(2)}B`
        } else {
            return `$${n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
        }
    }

    const revenueWidth = (revenue / obligatedAmount) * 100
    const outlaysWidth = (outlays / obligatedAmount) * 100
    
    const outlaysDiff = outlays - revenue
    const obligatedDiff = obligatedAmount - revenue

    return (<div className="budget-stack">
        <div 
            className="tax-revenue" 
            style={{ '--width-percent': `${revenueWidth}%` } as React.CSSProperties}
        >
            REVENUE: {formatNumber(revenue)}
        </div>
        <div 
            className="outlays"
            style={{ 
                '--width-percent': `${outlaysWidth}%`,
                '--base-width': `${(revenueWidth / outlaysWidth) * 100}%`
            } as React.CSSProperties}
        >
            <div className="content-wrapper">
                <div className="base-content">OUTLAYS: {formatNumber(outlays)}</div>
                <div className="diff-content">(+{formatNumber(outlaysDiff)})</div>
            </div>
        </div>
        <div 
            className="over-budget"
            style={{ 
                '--base-width': `${revenueWidth}%`
            } as React.CSSProperties}
        >
            <div className="content-wrapper">
                <div className="base-content">OBLIGATED AMOUNT: {formatNumber(obligatedAmount)}</div>
                <div className="diff-content">(+{formatNumber(obligatedDiff)})</div>
            </div>
        </div>
    </div>)
}

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
      <Titlebar 
        total={data.total}
        breadcrumbs={[]}
      />
      <BudgetStack />
      <ViewToggle 
        view={search.view} 
        onViewChange={(newView) => {
          navigate({ to: '/', search: { view: newView } })
        }} 
      />
      {search.view === 'tree' ? (
        <TreeView data={treeData} />
      ) : (
        <ListView data={treeData} />
      )}
    </div>
  )
}
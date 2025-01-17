import { createLazyFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import React from 'react'
import { TreeView, TreeViewData } from '../TreeView'
import { ListView } from '../ListView'
import { Titlebar } from '../Titlebar'
import { ViewToggle } from '../ViewToggle'
import apiData from '../fy2024.json'
import { SearchParams } from './__root'
import { useUserAmount } from '../UserAmountContext'
import { scaleToUserAmount } from '../budgetMath'

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
    const { amount: userAmount, useUserMoney } = useUserAmount()
    // 9.7 trillion
    const obligatedAmount = 9700000000000
    // 6.752 trillion
    const outlays = 6752000000000
    // 4.919 trillion
    const revenue = 4919000000000

    const baseNumbers = {
        revenue,
        outlays,
        obligatedAmount
    }

    // Treat 0 as 1 for scaling purposes
    const effectiveAmount = userAmount === 0 ? 1 : userAmount
    const numbers = scaleToUserAmount(baseNumbers, effectiveAmount, useUserMoney)

    // Ex: $1.43T
    // Ex: $1.43B
    const formatNumber = (n: number) => {
        if (n > 1000000000000) {
            return `$${(n / 1000000000000).toFixed(2)}T`
        } else if (n > 1000000000) {
            return `$${(n / 1000000000).toFixed(2)}B`
        } else if (n > 1000) {
            return `$${Math.round(n / 1000)}k`
        } else if (n > 99) {
            return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
        } else {
            return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        }
    }

    const revenueWidth = (numbers.revenue / numbers.obligatedAmount) * 100
    const outlaysWidth = (numbers.outlays / numbers.obligatedAmount) * 100

    const outlaysDiff = numbers.outlays - numbers.revenue

    return (
        <>
            <div className="budget-stack">
                <div className="budget-item">
                    <div className="title">REVENUE</div>
                    <div
                        className="tax-revenue"
                        style={{ '--width-percent': `${revenueWidth}%` } as React.CSSProperties}
                    >
                        {formatNumber(numbers.revenue)}
                    </div>
                </div>
                <div className="budget-item">
                    <div className="title">OUTLAYS</div>
                    <div
                        className="outlays"
                        style={{
                            '--width-percent': `${outlaysWidth}%`,
                            '--base-width': `${(revenueWidth / outlaysWidth) * 100}%`
                        } as React.CSSProperties}
                    >
                        <div className="content-wrapper">
                            <div className="base-content">{formatNumber(numbers.outlays)}</div>
                            <div className="diff-content">(+{formatNumber(outlaysDiff)})</div>
                        </div>
                        <div className="marker label deficit">printed this</div>
                    </div>
                </div>
                <div className="budget-item">
                    <div className="title">OBLIGATED AMOUNT</div>
                    <div
                        className="over-budget"
                        style={{
                            '--base-width': `${revenueWidth}%`,
                            '--outlays-width': `${outlaysWidth}%`
                        } as React.CSSProperties}
                    >
                        <div className="content-wrapper">
                            <div className="base-content">{formatNumber(numbers.obligatedAmount)}</div>
                            <div className="diff-content">(+{formatNumber(outlaysDiff)})</div>
                            <div className="remaining-content">(+{formatNumber(numbers.remainingObligated)})</div>
                        </div>
                        <div className="marker label future-obligations">our kids pay this</div>
                    </div>
                </div>
            </div>
        </>
    )
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
            <h1 className="marker">Budget</h1>
            <BudgetStack />
            <div className="flex-header">
                <h1 className="marker">Agencies</h1>
                <ViewToggle
                    view={search.view}
                    onViewChange={(newView) => {
                        navigate({ to: '/', search: { view: newView } })
                    }}
                />
            </div>
            {search.view === 'tree' ? (
                <TreeView data={treeData} />
            ) : (
                <ListView data={treeData} />
            )}
        </div>
    )
}
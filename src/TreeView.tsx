import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from '@tanstack/react-router';
import moneyJpg from './assets/money.jpg';
import { useUserAmount } from './UserAmountContext';

export interface TreeViewData {
  name: string;
  id: string;
  value: number;
  metadata?: {
    account_number?: string;
    [key: string]: any;
  };
}

interface TreemapData extends TreeViewData {
  children?: TreeViewData[];
}

interface TreeViewProps {
  data: TreeViewData[];
  title?: string;
  onItemClick?: (item: TreeViewData) => void;
  parentPercentage?: number;
}

type TreemapNode = d3.HierarchyRectangularNode<TreemapData> & {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export const TreeView = ({ data, title = "Government Spending", onItemClick, parentPercentage }: TreeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const { amount: userAmount, useUserMoney } = useUserAmount();

  const treemapData: TreemapData = {
    name: title,
    id: 'root',
    value: 0,
    children: data
  };

  const createChart = () => {
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const { width: containerWidth } = container.getBoundingClientRect();
    const height = 1024; // Fixed height

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Format numbers for display
    const formatNumber = (n: number) => {
        if (n > 1000000000000) {
            return `$${(n / 1000000000000).toFixed(2)}T`
        } else if (n > 1000000000) {
            return `$${(n / 1000000000).toFixed(2)}B`
        } else {
            return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
        }
    };

    // Format percentage
    const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

    // Calculate user's scaled amount
    const calculateUserAmount = (value: number) => {
      if (!useUserMoney || userAmount === 0) return null;
      
      // First get the parent-scaled amount if we're in a sub-view
      const effectiveUserAmount = parentPercentage !== undefined 
        ? userAmount * parentPercentage
        : userAmount;
      
      // Then calculate this item's percentage of its parent
      const ratio = value / treemapData.children!.reduce((sum, child) => sum + child.value, 0);
      return effectiveUserAmount * ratio;
    };

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create pattern for money GIF
    const defs = svg.append('defs');
    const pattern = defs.append('pattern')
      .attr('id', 'money-pattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 64)
      .attr('height', 64);

    pattern.append('image')
      .attr('href', moneyJpg)
      .attr('width', 64)
      .attr('height', 64)
      .attr('preserveAspectRatio', 'xMidYMid slice');

    // Create treemap layout
    const treemap = d3.treemap<TreemapData>()
      .size([innerWidth, innerHeight])
      .padding(1)
      .round(true);

    // Create hierarchy and compute values
    const root = d3.hierarchy(treemapData)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Generate treemap layout
    treemap(root);

    // Calculate total for percentage
    const total = root.value || 0;

    // Create color scale
    const colorScale = d3.scaleLinear<string>()
      .domain([0, root.children?.length || 0])
      .range(['#000000', '#EEEEEE']);

    // Add group for margins
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add cells
    const cell = g.selectAll<SVGGElement, TreemapNode>('g')
      .data(root.leaves() as TreemapNode[])
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`)
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        const nodeData = d.data;
        if (nodeData.id) {
          if (onItemClick) {
            onItemClick(nodeData);
          } else {
            navigate({ 
              to: '/agency/$agencyId',
              params: { agencyId: nodeData.id },
              search: (prev) => ({ ...prev })
            });
          }
        }
      });

    // Add rectangles
    cell.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', (_d, i) => colorScale(i))
      .attr('opacity', 0.8)
      .style('transition', 'opacity 0.3s ease')
      .on('mouseover', function() {
        d3.select(this)
          .attr('opacity', 1)
          .attr('fill', 'url(#money-pattern)');
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('fill', (_d, i) => colorScale(i));
      });

    // Add text
    cell.append('text')
      .selectAll('tspan')
      .data(d => {
        const nodeData = d.data;
        const name = nodeData.name;
        const percent = formatPercent((d.value || 0) / total);
        const dollars = formatNumber(d.value || 0);
        const userScaledAmount = calculateUserAmount(d.value || 0);
        const lines = [
          name,
          percent,
          dollars
        ];
        if (userScaledAmount !== null) {
          lines.push(`${formatNumber(userScaledAmount)} from you`);
        }
        return lines;
      })
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (_d, i) => 13 + i * 15)
      .attr('fill', 'white')
      .style('font-family', 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif')
      .style('font-size', '14px')
      .text(d => d);
  };

  useEffect(() => {
    createChart();

    // Create ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      createChart();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [data, useUserMoney, userAmount]); // Re-run when data, useUserMoney, or userAmount changes

  return (
    <div className="tree-view" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
}; 
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';

export interface TreeViewData {
  name: string;
  id: string;
  value: number;
  metadata?: {
    account_number?: string;
    [key: string]: any;
  };
}

interface TreemapData {
  name: string;
  value?: number;
  children: TreeViewData[];
}

interface TreeViewProps {
  data: TreeViewData[];
  title?: string;
  onItemClick?: (item: TreeViewData) => void;
}

export const TreeView = ({ data, title = "Government Spending", onItemClick }: TreeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const { view } = RootRoute.useSearch();

  const treemapData: TreemapData = {
    name: title,
    children: data
  };

  const createChart = () => {
    if (!svgRef.current || !containerRef.current) return;

    // Get container dimensions
    const container = containerRef.current;
    const { width: containerWidth } = container.getBoundingClientRect();
    const height = 530; // Fixed height

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = containerWidth;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Format numbers for display
    const formatNumber = (n: number) => {
      if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
      if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
      if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
      return n.toString();
    };

    // Format percentage
    const formatPercent = (n: number) => `${(n * 100).toFixed(1)}%`;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create treemap layout
    const treemap = d3.treemap<TreemapData>()
      .size([innerWidth, innerHeight])
      .padding(1)
      .round(true);

    // Create hierarchy and compute values
    const root = d3.hierarchy(treemapData)
      .sum(d => ('value' in d ? d.value : 0) as number)
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
    const cell = g.selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${(d as any).x0},${(d as any).y0})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        const id = (d.data as TreeViewData).id;
        if (id) {
          if (onItemClick) {
            onItemClick(d.data as TreeViewData);
          } else {
            navigate({ 
              to: '/agency/$agency', 
              params: { agency: id },
              search: { view }
            });
          }
        }
      });

    // Add rectangles
    cell.append('rect')
      .attr('width', d => (d as any).x1 - (d as any).x0)
      .attr('height', d => (d as any).y1 - (d as any).y0)
      .attr('fill', (d, i) => colorScale(i))
      .attr('opacity', 0.8);

    // Add text
    cell.append('text')
      .selectAll('tspan')
      .data(d => {
        const name = (d.data as TreeViewData).name;
        const percent = formatPercent((d.value || 0) / total);
        return [
          name.length > 20 ? name.slice(0, 20) + '...' : name,
          percent
        ];
      })
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) => 13 + i * 10)
      .attr('fill', 'white')
      .style('font-size', '10px')
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
  }, [data]); // Re-run when data changes

  return (
    <div className="tree-view" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  );
}; 
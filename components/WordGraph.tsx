
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GraphData, Theme } from '../types';

interface WordGraphProps {
    graphData: GraphData;
    theme: Theme;
}

export const WordGraph: React.FC<WordGraphProps> = ({ graphData, theme }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Fix: Add robust checks for nodes and links before attempting to render the graph.
        if (!svgRef.current || !graphData || !Array.isArray(graphData.nodes) || !Array.isArray(graphData.links) || graphData.nodes.length === 0) {
            return;
        }

        const width = svg.node()?.getBoundingClientRect().width || 500;
        const height = svg.node()?.getBoundingClientRect().height || 400;

        // Create copies to avoid mutating props
        const nodes = graphData.nodes.map(d => ({...d}));
        const links = graphData.links.map(d => ({...d}));
        
        const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
            .force("link", d3.forceLink(links).id((d: any) => d.id).distance(70))
            .force("charge", d3.forceManyBody().strength(-150))
            .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("stroke", theme.secondary)
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", 1.5);

        const node = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation) as any);

        node.append("circle")
            .attr("r", 8)
            .attr("fill", theme.primary)
            .attr("stroke", theme.accent)
            .attr("stroke-width", 2);

        node.append("text")
            .text((d: any) => d.id)
            .attr("x", 12)
            .attr("y", 4)
            .attr("fill", "currentColor")
            .style("font-size", "12px")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        function drag(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
          function dragstarted(event: any) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
          }
          function dragged(event: any) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
          }
          function dragended(event: any) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
          }
          return d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
        }

    }, [graphData, theme]);

    return (
        <div className="w-full h-[400px]">
            <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
    );
};

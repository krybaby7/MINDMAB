import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { MindMapData } from './types';

interface MindMapProps {
  data: MindMapData;
}

export function MindMap({ data }: MindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [
        ...data.nodes.map((node) => ({
          data: { id: node.id, label: node.label },
        })),
        ...data.edges.map((edge) => ({
          data: { id: edge.id, source: edge.source, target: edge.target },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4299e1',
            'label': 'data(label)',
            'color': '#2d3748',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'width': '120px',
            'height': '40px',
            'shape': 'roundrectangle',
            'padding': '10px',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#a0aec0',
            'target-arrow-color': '#a0aec0',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 30,
        spacingFactor: 1.5,
        animate: true,
      },
    });

    // Clean up
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div ref={containerRef} className="w-full h-full" />
  );
}

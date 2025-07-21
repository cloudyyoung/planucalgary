import {
  Position,
  type Node,
  type Edge,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { v4 as uuidv4 } from 'uuid';
import { getOperator } from './requisites-json';


export const getRequisitesFlow = (prereq_json: any): [Node[], Edge[]] => {
  if (!prereq_json) {
    return [[], []]
  }

  if (typeof prereq_json === 'string') {
    const nodes: Node[] = [{ id: 'n1', position: { x: 0, y: 0 }, data: { label: prereq_json } }]
    const edges: Edge[] = []
    return [nodes, edges]
  }

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 2, edgesep: 20,});
  g.setDefaultEdgeLabel(function () { return {}; });
  getRequisitesGraph(prereq_json, g);
  dagre.layout(g);
  
  g.nodes().forEach(function(v) {
    console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
  });
  g.edges().forEach(function(e) {
    console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
  });
  
  const nodes = g.nodes().map((nodeId) => {
    const node = g.node(nodeId);
    const isRelation = String(nodeId).startsWith('r-');

    return {
      id: nodeId,
      position: { x: node.x, y: node.y },
      width: node.width,
      height: node.height,
      data: { label: node.label },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      draggable: false,
      selectable: false,
      style: { borderRadius: '999px', backgroundColor: isRelation ? '#f0f0f0' : '#fff' },
    }
  })

  const edges = g.edges().map((edge) => {
    const graphEdge = g.edge(edge);
    return {
      id: `${edge.v}-${edge.w}`,
      label: graphEdge.label,
      source: edge.v,
      target: edge.w,
      style: { stroke: '#000' },
      draggable: false,
      selectable: false,
      type: 'smoothstep',
      pathOptions: { borderRadius: 10 },
    }
  })

  return [nodes, edges]
}

const getRequisitesGraph = (obj: any, graph: dagre.graphlib.Graph): string => {
  if (typeof obj === 'string') {
    const nodeId = `n-${uuidv4()}`;
    graph.setNode(nodeId, { label: obj, width: 150, height: 40 });
    return nodeId;
  }

  const operator = getOperator(obj)
  if (operator) {
    const relationId = `r-${uuidv4()}`;
    graph.setNode(relationId, { label: operator.key, width: 40, height: 40 });

    operator.children.forEach((child) => {
      const childNodeId = getRequisitesGraph(child, graph);
      if (childNodeId) {
        graph.setEdge(relationId, childNodeId);
      }
    });

    return relationId;
  }

  const nodeId = `n-${uuidv4()}`;
  graph.setNode(nodeId, {
    label: JSON.stringify(obj),
    width: 150,
    height: 40,
  });
  return nodeId;
}
